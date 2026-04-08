using Azure.Identity;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;
using VerapathWebsite.Models;

namespace VerapathWebsite.Services;

public class GraphEmailService : IEmailService
{
    private readonly AzureAdOptions _azureAd;
    private readonly string _recipientAddress;

    public GraphEmailService(IOptions<AzureAdOptions> azureAdOptions, IConfiguration configuration)
    {
        _azureAd = azureAdOptions.Value;
        _recipientAddress = configuration["ContactEmail:RecipientAddress"] ?? "info@verapath.com";
    }

    public async Task SendContactFormAsync(ContactFormModel form)
    {
        var credential = new ClientSecretCredential(
            _azureAd.TenantId,
            _azureAd.ClientId,
            _azureAd.ClientSecret);

        var graphClient = new GraphServiceClient(credential);

        var message = new Message
        {
            Subject = $"Contact Form Submission from {form.Name} ({form.CompanyName})",
            Body = new ItemBody
            {
                ContentType = BodyType.Html,
                Content = $"""
                    <h2>New Contact Form Submission</h2>
                    <table>
                      <tr><td><strong>Name:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(form.Name)}</td></tr>
                      <tr><td><strong>Title:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(form.Title)}</td></tr>
                      <tr><td><strong>Email:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(form.EmailAddress)}</td></tr>
                      <tr><td><strong>Company:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(form.CompanyName)}</td></tr>
                      <tr><td><strong>Message:</strong></td><td>{System.Web.HttpUtility.HtmlEncode(form.Message)}</td></tr>
                    </table>
                    """
            },
            ToRecipients =
            [
                new Recipient
                {
                    EmailAddress = new EmailAddress { Address = _recipientAddress }
                }
            ]
        };

        var requestBody = new SendMailPostRequestBody { Message = message };
        await graphClient.Users["noreply@verapath.com"].SendMail.PostAsync(requestBody);
    }
}
