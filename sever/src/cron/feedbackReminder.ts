import { db } from "../db";
import { feedbacks, users } from "../db/schema";
import { eq, and, lt, or, isNull } from "drizzle-orm";

// 定时提醒未接手的反馈
export async function remindUnassignedFeedbacks() {
  console.log("[Cron] 开始检查未接手的反馈...");

  // 查找需要提醒的反馈
  // 规则：
  // 1. 创建超过1小时未接手，提醒一次
  // 2. 创建超过24小时未接手，再次提醒
  // 3. 创建超过3天未接手，再次提醒
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  
  // 查找需要提醒的反馈
  const unassignedFeedbacks = await db.query.feedbacks.findMany({
    where: and(
      isNull(feedbacks.charge),  // 未接手
      eq(feedbacks.status, 0),     // 待处理状态
      or(
        and(
          lt(feedbacks.createdAt, oneHourAgo),
          eq(feedbacks.remindCount, 0)  // 从未提醒过
        ),
        and(
          lt(feedbacks.createdAt, oneDayAgo),
          eq(feedbacks.remindCount, 1)  // 已提醒1次
        ),
        and(
          lt(feedbacks.createdAt, threeDaysAgo),
          eq(feedbacks.remindCount, 2)  // 已提醒2次
        )
      )
    ),
    with: {
      giverUser: {
        columns: {
          id: true,
          loginId: true,
          nickname: true,
        },
      },
    },
  });
  
  console.log(`[Cron] 找到 ${unassignedFeedbacks.length} 个需要提醒的反馈`);
  
  // 发送提醒（这里可以集成邮件、短信、站内信等）
  for (const feedback of unassignedFeedbacks) {
    console.log(`[Cron] 提醒反馈 #${feedback.id}: ${feedback.title}`);
    console.log(`[Cron] 反馈人: ${feedback.giverUser?.nickname} (${feedback.giverUser?.loginId})`);
    console.log(`[Cron] 创建时间: ${feedback.createdAt}`);
    console.log(`[Cron] 提醒次数: ${feedback.remindCount}`);
    
    // TODO: 这里可以添加实际的提醒逻辑
    // 例如：发送邮件给管理员、发送站内信等
    
    // 更新提醒记录
    await db.update(feedbacks)
      .set({
        lastRemindedAt: new Date(),
        remindCount: (feedback.remindCount || 0) + 1,
      })
      .where(eq(feedbacks.id, feedback.id));
  }
  
  console.log("[Cron] 反馈提醒任务完成");
}
