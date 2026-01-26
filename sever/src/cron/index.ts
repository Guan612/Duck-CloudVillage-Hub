import { Cron } from "croner";
import { remindUnassignedFeedbacks } from "./feedbackReminder";

// 定时任务配置
export function startCronJobs() {
  console.log("[Cron] 启动定时任务...");

  // 每30分钟检查一次未接手的反馈
  const feedbackReminderJob = new Cron("*/30 * * * *", () => {
    console.log("[Cron] 执行反馈提醒任务");
    remindUnassignedFeedbacks().catch((error) => {
      console.error("[Cron] 反馈提醒任务失败:", error);
    });
  });

  console.log("[Cron] 定时任务已启动");
  console.log("[Cron] 反馈提醒任务: 每30分钟执行一次");

  return {
    feedbackReminderJob,
  };
}
