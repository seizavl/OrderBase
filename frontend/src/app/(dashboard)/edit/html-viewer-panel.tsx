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
      <div className="relative w-full h-full">
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col">
          <div className="rounded-xl overflow-hidden flex flex-col h-full bg-white">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Code className={`w-5 h-5 ${viewerId === 1 ? "text-blue-600" : "text-purple-600"}`} />
                <span className="text-sm text-gray-700 font-mono font-medium">
                  localhost:300{viewerId - 1}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSave}
                  disabled={!html}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    html
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>

            <div className="aspect-video">
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
