interface HtmlPreviewProps {
  htmlPreview: string;
  onSaveClick: () => void;
}

export default function HtmlPreview({ htmlPreview, onSaveClick }: HtmlPreviewProps) {
  return (
    <div className="bg-white p-6 rounded shadow text-gray-700">
      <p className="mb-2 text-gray-500 text-sm">以下がメニューのプレビューです：</p>
      <div
        className="border p-4 rounded text-base min-h-[100px]"
        dangerouslySetInnerHTML={{ __html: htmlPreview }}
      />
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={onSaveClick}
      >
        このHTMLを保存する
      </button>
    </div>
  );
}
