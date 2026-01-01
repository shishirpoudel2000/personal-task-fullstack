using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Personal_Task.Data;
using Personal_Task.Models;
using System;

namespace Personal_Task.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/tasks
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tasks = await _context.TaskItems
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    // GET: api/tasks/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _context.TaskItems.FindAsync(id);

        if (task == null)
            return NotFound();

        return Ok(task);
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaskItem task)
    {
        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    // PUT: api/tasks/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TaskItem updatedTask)
    {
        var task = await _context.TaskItems.FindAsync(id);

        if (task == null)
            return NotFound();

        // ✅ Explicitly update fields
        task.Title = updatedTask.Title;
        task.IsCompleted = updatedTask.IsCompleted;

        await _context.SaveChangesAsync();

        return NoContent();
    }


    // DELETE: api/tasks/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _context.TaskItems.FindAsync(id);

        if (task == null)
            return NotFound();

        _context.TaskItems.Remove(task);
        await _context.SaveChangesAsync();
        return NoContent();
    }



}
