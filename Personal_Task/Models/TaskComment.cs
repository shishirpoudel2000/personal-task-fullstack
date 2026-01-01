using System.ComponentModel.DataAnnotations;

namespace Personal_Task.Models
{
    public class TaskComment
    {
        public int Id { get; set; }

        [Required]
        public int TaskId { get; set; }

        [Required]
        public string CommentText { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
