export const roleAccess: Record<string, string[]> = {
  normal: [
    "/",
    "/reception",
    "/assistant",
    "/assistant/received",
    "/assistant/completed",
    "/assistant/request",
    "/helper",
    "/exams",
    "/setting",
    "/exams/consultant",
    "/exams/lesson"
  ],

  platform_admin: [
    "/platform_Manager/users",
    "/platform_Manager/report",
    "/platform_Manager/manager",
    "/platform_Manager/consultant",
    "/platform_Manager/normalusers",
    "/setting",
    "/",
  ],

  consultant: [
    "/",
    "/assistantpanel/received",
    "/assistantpanel/completed",
    "/assistantpanel/time",
    "/assistantpanel/report",
    "/setting",
  ],

  school_admin: ["/", "/manager", "/manager/users", "/manager/report", "/setting"],
};