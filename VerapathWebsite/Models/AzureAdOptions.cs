namespace VerapathWebsite.Models;

public class AzureAdOptions
{
    public string? Instance { get; set; } = string.Empty;
    public string? Domain { get; set; } = string.Empty;
    public string? TenantId { get; set; } = string.Empty;
    public string? ClientId { get; set; } = string.Empty;
    public string? CallbackPath { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string? BackendScope { get; set; } = string.Empty;
    public string? RedirectUriPhone { get; set; } = string.Empty;
}
