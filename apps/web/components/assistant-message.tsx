import Markdown from "react-markdown";

export function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="debate-markdown text-sm leading-7">
      <Markdown>{content}</Markdown>
    </div>
  );
}
