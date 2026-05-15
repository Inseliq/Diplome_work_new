namespace CosmoManager.Responses;

public sealed record AuthResponse(
    string Message,
    string AccessToken,
    AuthUserResponse User
);