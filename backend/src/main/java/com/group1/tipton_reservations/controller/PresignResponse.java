package com.group1.tipton_reservations.controller;

public class PresignResponse {
    private final String uploadUrl;
    private final String key;

    public PresignResponse(String uploadUrl, String key) {
        this.uploadUrl = uploadUrl;
        this.key = key;
    }

    public String getUploadUrl() {
        return uploadUrl;
    }

    public String getKey() {
        return key;
    }
}
