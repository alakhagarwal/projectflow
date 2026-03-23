## Plan: Task Assignment Email Notification

Add task-assignment email delivery to the existing task creation flow by reusing your current mail architecture in `EmailService`. The plan extends `TaskService#createTask` to trigger a styled HTML email (with a “View Task” button) after task persistence, using `app.frontend.url` for the website link. This keeps your existing endpoint contract unchanged while adding notification behavior. Draft for your review.

### Steps
1. Review current mail pattern in [EmailService.java](src/main/java/com/projectmanagement/project_management_system/Service/EmailService.java) and reuse `sendInvitationEmail` structure.
2. Add `sendTaskAssignedEmail(...)` and `buildTaskAssignedEmailHtml(...)` in [EmailService.java](src/main/java/com/projectmanagement/project_management_system/Service/EmailService.java) with task/project fields and CTA button.
3. Inject `EmailService` into [TaskService.java](src/main/java/com/projectmanagement/project_management_system/Service/TaskService.java) and call it from `createTask` after `taskRepository.save(task)`.
4. Build the button URL from `app.frontend.url` in [application.properties](src/main/resources/application.properties), using a stable task-detail path convention.
5. Define email-failure behavior in `createTask`: either fail the request or continue task creation with logged notification error.
6. Document side effect for `POST /task/create/{projId}` in your API docs file (or a new task-endpoints markdown).

### Further Considerations
1. Button destination route: Option A `/tasks/{taskId}`; Option B `/projects/{projectId}/tasks/{taskId}`; Option C generic `/dashboard`.
2. Mail failure policy: Option A strict rollback; Option B best-effort (recommended for reliability); Option C async retry queue later.
3. Email trigger scope: send only on create now, or also when assignee changes during future task update endpoint?
