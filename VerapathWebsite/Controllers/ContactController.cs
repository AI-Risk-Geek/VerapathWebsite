using Microsoft.AspNetCore.Mvc;
using VerapathWebsite.Models;
using VerapathWebsite.Services;

namespace VerapathWebsite.Controllers;

[Route("contact")]
public class ContactController : Controller
{
    private readonly IEmailService _emailService;

    public ContactController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost("submit")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Submit([FromForm] ContactFormModel form)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, error = "Invalid form data." });

        await _emailService.SendContactFormAsync(form);
        return Ok(new { success = true });
    }
}
