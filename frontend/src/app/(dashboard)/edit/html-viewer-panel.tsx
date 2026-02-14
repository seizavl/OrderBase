"use client"
import { Code, Save } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface HtmlViewerPanelProps {
  html: string
  title: string
  icon: LucideIcon
  viewerId: number
  onSave?: () => void
}

export default function HtmlViewerPanel({ html, title, icon: Icon, viewerId, onSave }: HtmlViewerPanelProps) {

  return (
    <div className="h-full flex flex-col">
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex flex-col items-center">
          <button
            onClick={onSave}
            disabled={!html}
            className={`flex items-center text-sm font-medium rounded-xl transition-all duration-200 ${
              html
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" />
            保存
          </button>

          <div className="relative" style={{ width: "420px", height: "844px", scale: "0.7" }}>
            <div className="absolute inset-0 bg-black rounded-[3rem] shadow-2xl"></div>
            <div className="absolute inset-0 rounded-[3rem] overflow-hidden" style={{ margin: "12px" }}>
              <iframe
                srcDoc={html.includes('<base') ? html : `<base href="http://localhost:8080/">${html}`}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                sandbox="allow-same-origin allow-scripts allow-forms"
                title={`HTML Preview ${viewerId}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
