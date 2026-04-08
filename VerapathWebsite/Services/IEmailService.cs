using VerapathWebsite.Models;

namespace VerapathWebsite.Services;

public interface IEmailService
{
    Task SendContactFormAsync(ContactFormModel form);
}
