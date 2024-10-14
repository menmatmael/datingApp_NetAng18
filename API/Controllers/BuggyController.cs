using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class BuggyController(DataContext context) : BaseApiController
    {
        [Authorize]
        [HttpGet("auth")]
        public ActionResult<string> GetAuth()
        {
            return "Secret Text";
        }

        [HttpGet("not-found")]
        public ActionResult<AppUser> GetNotFound()
        {
            var unknownUser = context.Users.Find(-1);

            if (unknownUser == null) return NotFound();

            return unknownUser;
        }

        [HttpGet("server-error")]
        public ActionResult<AppUser> GetServerError()
        {
            var unknownUser = context.Users.Find(-1) ?? throw new Exception("A bad thing has happened");
            
            return unknownUser;
        }

        [HttpGet("bad-request")]
        public ActionResult<string> GetBadRequest()
        {
            return BadRequest("Not a good request");
        }
    }
}
