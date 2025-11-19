# -*- coding: utf-8 -*-
"""
Created on Thu Dec  3 00:28:15 2020

@author: Yunpeng Li, Tianjin University
"""


import torch
import torch.nn as nn
import torch.nn.functional as F


class MS_SSIM_L1_LOSS(nn.Module):
    # Have to use cuda, otherwise the speed is too slow.
    def __init__(self, gaussian_sigmas=[0.5, 1.0, 2.0, 4.0, 8.0],
                 data_range = 1.0,
                 K=(0.01, 0.03),
                 alpha=0.025,
                 compensation=200.0,
                 device='cuda'):
        super(MS_SSIM_L1_LOSS, self).__init__()
        self.DR = data_range
        self.C1 = (K[0] * data_range) ** 2
        self.C2 = (K[1] * data_range) ** 2
        self.pad = int(2 * gaussian_sigmas[-1])
        self.alpha = alpha
        self.compensation=compensation
        # Resolve device from user input ("cuda" or "cpu")
        self.device = torch.device('cuda' if (str(device).lower() == 'cuda' and torch.cuda.is_available()) else 'cpu')
        filter_size = int(4 * gaussian_sigmas[-1] + 1)
        # Base kernels: one per sigma, channel-agnostic. We will repeat per channel at runtime.
        g_masks_base = torch.zeros((len(gaussian_sigmas), 1, filter_size, filter_size))
        for idx, sigma in enumerate(gaussian_sigmas):
            g_masks_base[idx, 0, :, :] = self._fspecial_gauss_2d(filter_size, sigma)
        # Register as buffer so it moves with the module and saves in state_dict
        self.register_buffer('g_masks_base', g_masks_base.to(self.device))

    def _fspecial_gauss_1d(self, size, sigma):
        """Create 1-D gauss kernel
        Args:
            size (int): the size of gauss kernel
            sigma (float): sigma of normal distribution

        Returns:
            torch.Tensor: 1D kernel (size)
        """
        coords = torch.arange(size).to(dtype=torch.float)
        coords -= size // 2
        g = torch.exp(-(coords ** 2) / (2 * sigma ** 2))
        g /= g.sum()
        return g.reshape(-1)

    def _fspecial_gauss_2d(self, size, sigma):
        """Create 2-D gauss kernel
        Args:
            size (int): the size of gauss kernel
            sigma (float): sigma of normal distribution

        Returns:
            torch.Tensor: 2D kernel (size x size)
        """
        gaussian_vec = self._fspecial_gauss_1d(size, sigma)
        return torch.outer(gaussian_vec, gaussian_vec)

    def forward(self, x, y):
        # Ensure both tensors are on the configured device and share dtype
        x = x.to(self.device)
        y = y.to(self.device, dtype=x.dtype)
        b, c, h, w = x.shape
        # Repeat Gaussian kernels per input channel so we can use depthwise groups=c
        # Ensure kernel dtype matches input dtype to avoid Float/Double mismatches
        g = self.g_masks_base.to(dtype=x.dtype).repeat_interleave(c, dim=0)
        mux = F.conv2d(x, g, groups=c, padding=self.pad)
        muy = F.conv2d(y, g, groups=c, padding=self.pad)

        mux2 = mux * mux
        muy2 = muy * muy
        muxy = mux * muy

        sigmax2 = F.conv2d(x * x, g, groups=c, padding=self.pad) - mux2
        sigmay2 = F.conv2d(y * y, g, groups=c, padding=self.pad) - muy2
        sigmaxy = F.conv2d(x * y, g, groups=c, padding=self.pad) - muxy

        # l(j), cs(j) in MS-SSIM
        l  = (2 * muxy    + self.C1) / (mux2    + muy2    + self.C1)  # [B, 15, H, W]
        cs = (2 * sigmaxy + self.C2) / (sigmax2 + sigmay2 + self.C2)

        # Product of luminance at the largest scale across channels (generalized for any c)
        lM = l[:, -c:, :, :].prod(dim=1)
        PIcs = cs.prod(dim=1)

        loss_ms_ssim = 1 - lM*PIcs  # [B, H, W]

        loss_l1 = F.l1_loss(x, y, reduction='none')  # [B, C, H, W]
        # Average l1 loss across C channels using the largest-scale Gaussian
        g_last = g.narrow(dim=0, start=g.size(0)-c, length=c)
        gaussian_l1 = F.conv2d(loss_l1, g_last, groups=c, padding=self.pad).mean(1)  # [B, H, W]

        loss_mix = self.alpha * loss_ms_ssim + (1 - self.alpha) * gaussian_l1 / self.DR
        loss_mix = self.compensation*loss_mix

        return loss_mix.mean()

