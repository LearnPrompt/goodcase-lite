export type OwnerNotificationKind = "feedback" | "case_submission";

export type OwnerNotification = {
  kind: OwnerNotificationKind;
  receiptId: string;
  title: string;
  lines: string[];
  createdAt: string;
};

type NotificationFormat = "generic" | "feishu";

type SendOwnerNotificationOptions = {
  webhookUrl?: string;
  format?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export type OwnerNotificationResult = {
  status: "sent" | "disabled" | "failed";
  responseStatus?: number;
};

const KIND_LABELS: Record<OwnerNotificationKind, string> = {
  feedback: "新反馈",
  case_submission: "新 Case 投稿",
};

function cleanLine(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

function isAllowedWebhookUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol === "https:") {
      return true;
    }
    return (
      url.protocol === "http:" &&
      (url.hostname === "127.0.0.1" ||
        url.hostname === "localhost" ||
        url.hostname === "::1")
    );
  } catch {
    return false;
  }
}

function normalizeFormat(value: string | undefined): NotificationFormat {
  return value?.trim().toLowerCase() === "feishu" ? "feishu" : "generic";
}

async function isFeishuSuccessResponse(response: Response) {
  try {
    const body: unknown = await response.json();
    if (!body || typeof body !== "object") {
      return false;
    }

    const result = body as { code?: unknown; StatusCode?: unknown };
    const codes = [result.code, result.StatusCode].filter(
      (value): value is number => typeof value === "number"
    );
    return codes.length > 0 && codes.every((code) => code === 0);
  } catch {
    return false;
  }
}

export function buildOwnerNotificationText(notification: OwnerNotification) {
  const lines = notification.lines.map(cleanLine).filter(Boolean).slice(0, 8);
  return [
    `[GoodCase] ${KIND_LABELS[notification.kind]}`,
    `收件编号：${notification.receiptId}`,
    `时间：${notification.createdAt}`,
    `标题：${cleanLine(notification.title)}`,
    ...lines,
  ].join("\n");
}

export function buildOwnerNotificationPayload(
  notification: OwnerNotification,
  format: string | undefined
) {
  const normalizedFormat = normalizeFormat(format);
  const text = buildOwnerNotificationText(notification);

  if (normalizedFormat === "feishu") {
    return {
      msg_type: "text",
      content: { text },
    };
  }

  return {
    event: `goodcase.${notification.kind}.created`,
    receiptId: notification.receiptId,
    createdAt: notification.createdAt,
    title: notification.title,
    text,
  };
}

export async function sendOwnerNotification(
  notification: OwnerNotification,
  options: SendOwnerNotificationOptions = {}
): Promise<OwnerNotificationResult> {
  const webhookUrl = options.webhookUrl ?? process.env.GOODCASE_OWNER_WEBHOOK_URL;
  if (!webhookUrl) {
    return { status: "disabled" };
  }
  if (!isAllowedWebhookUrl(webhookUrl)) {
    return { status: "failed" };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const format = options.format ?? process.env.GOODCASE_OWNER_WEBHOOK_FORMAT;
  const timeoutMs = Math.min(Math.max(options.timeoutMs ?? 3_000, 500), 10_000);

  try {
    const response = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GoodCase-Event": `goodcase.${notification.kind}.created`,
      },
      body: JSON.stringify(buildOwnerNotificationPayload(notification, format)),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "failed", responseStatus: response.status };
    }

    if (
      normalizeFormat(format) === "feishu" &&
      !(await isFeishuSuccessResponse(response))
    ) {
      return { status: "failed", responseStatus: response.status };
    }

    return { status: "sent", responseStatus: response.status };
  } catch {
    return { status: "failed" };
  }
}
