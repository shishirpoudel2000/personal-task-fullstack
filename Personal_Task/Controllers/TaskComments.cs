using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Personal_Task.Data;
using Personal_Task.Models;
using System.Threading.Tasks;
using System;

namespace Personal_Task.Controllers
{
    [ApiController]
    [Route("api/tasks/{taskId}/comments")]
    public class TaskCommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskCommentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/tasks/{taskId}/comments
        [HttpGet]
        public async Task<IActionResult> Get(int taskId)
        {
            var comments = await _context.TaskComments
                .Where(c => c.TaskId == taskId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(comments);
        }

        // POST: api/tasks/{taskId}/comments
        [HttpPost]
        public async Task<IActionResult> Add(int taskId, [FromBody] TaskComment comment)
        {
            comment.TaskId = taskId;
            comment.CreatedAt = DateTime.UtcNow;

            _context.TaskComments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(comment);
        }

        // PUT: api/tasks/{taskId}/comments/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Edit(int id, [FromBody] TaskComment updated)
        {
            var comment = await _context.TaskComments.FindAsync(id);
            if (comment == null) return NotFound();

            comment.CommentText = updated.CommentText;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
