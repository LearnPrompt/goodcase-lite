import "server-only";

/**
 * 发布后触发一次部署。
 *
 * 案例详情页是构建期全量预渲染的（见 cases/[slug]/page.tsx 里的 dynamicParams），
 * 这样它们在运行期完全不打 Supabase，但代价是新发布的 Case 要等一次部署才可访问。
 * 这个 hook 就是用来补上那一次部署的。
 *
 * 三条硬约束：
 *   - 没配 VERCEL_DEPLOY_HOOK_URL 时静默跳过。发布本身必须能独立完成，
 *     没配 hook 只是意味着新 Case 要等下次部署，不是错误。
 *   - 触发失败绝不回滚发布，也绝不抛错。库已经写完了，
 *     因为一个部署没触发就把成功的发布报成失败，只会让运营重复点。
 *   - 只认环境变量里的地址，不接受调用方传 URL，避免把它变成一个转发器。
 */
export async function triggerDeployHook(reason: string): Promise<
  { triggered: true } | { triggered: false; skipped: true } | { triggered: false; error: string }
> {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) {
    return { triggered: false, skipped: true };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const error = `HTTP ${response.status}`;
      console.warn(`[deploy-hook] 触发失败（${reason}）：${error}`);
      return { triggered: false, error };
    }
    console.info(`[deploy-hook] 已触发部署（${reason}）`);
    return { triggered: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[deploy-hook] 触发失败（${reason}）：${message}`);
    return { triggered: false, error: message };
  }
}
