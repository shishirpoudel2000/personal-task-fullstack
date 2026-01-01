using Microsoft.EntityFrameworkCore;
using Personal_Task.Models;
using System.Collections.Generic;

namespace Personal_Task.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
    : base(options) { }
    public DbSet<TaskItem> TaskItems { get; set; } = null!;
    public DbSet<TaskComment> TaskComments { get; set; } = null!;

}
