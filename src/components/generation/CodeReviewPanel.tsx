'use client'

import { useState, useMemo } from 'react'
import { Copy, Edit, FileCode, HelpCircle, Folder, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { toast } from 'sonner'

export interface GeneratedFile {
  path: string
  content: string
  language: string
  explanation?: string
  category: 'ui' | 'api' | 'db' | 'test' | 'doc' | 'validation' | 'config'
}

interface CodeReviewPanelProps {
  files: GeneratedFile[]
  onApply: (files: GeneratedFile[]) => void
  onDiscard: () => void
  onSaveForLater?: (files: GeneratedFile[]) => void
  onEdit?: (file: GeneratedFile) => void
}

interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileTreeNode[]
  file?: GeneratedFile
}

export function CodeReviewPanel({
  files,
  onApply,
  onDiscard,
  onSaveForLater,
  onEdit,
}: CodeReviewPanelProps) {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile>(files[0])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(
    new Set(files.map((f) => f.path))
  )
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']))
  const [showExplanation, setShowExplanation] = useState(false)

  const fileTree = useMemo(() => buildFileTree(files), [files])

  const toggleFile = (path: string) => {
    const newSet = new Set(selectedFiles)
    if (newSet.has(path)) {
      newSet.delete(path)
    } else {
      newSet.add(path)
    }
    setSelectedFiles(newSet)
  }

  const toggleFolder = (path: string) => {
    const newSet = new Set(expandedFolders)
    if (newSet.has(path)) {
      newSet.delete(path)
    } else {
      newSet.add(path)
    }
    setExpandedFolders(newSet)
  }

  const selectAll = () => {
    setSelectedFiles(new Set(files.map((f) => f.path)))
  }

  const deselectAll = () => {
    setSelectedFiles(new Set())
  }

  const copyCode = async (file: GeneratedFile) => {
    await navigator.clipboard.writeText(file.content)
    toast.success('Code copied to clipboard')
  }

  const handleApply = () => {
    const filesToApply = files.filter((f) => selectedFiles.has(f.path))
    onApply(filesToApply)
  }

  const handleSaveForLater = () => {
    const filesToSave = files.filter((f) => selectedFiles.has(f.path))
    onSaveForLater?.(filesToSave)
  }

  // Group files by category for tabs
  const filesByCategory = useMemo(() => {
    const grouped: Record<string, GeneratedFile[]> = {
      all: files,
      ui: files.filter((f) => f.category === 'ui'),
      api: files.filter((f) => f.category === 'api'),
      db: files.filter((f) => f.category === 'db'),
      test: files.filter((f) => f.category === 'test'),
      doc: files.filter((f) => f.category === 'doc'),
    }
    return grouped
  }, [files])

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="all">All ({filesByCategory.all.length})</TabsTrigger>
          <TabsTrigger value="ui">UI ({filesByCategory.ui.length})</TabsTrigger>
          <TabsTrigger value="api">API ({filesByCategory.api.length})</TabsTrigger>
          <TabsTrigger value="db">DB ({filesByCategory.db.length})</TabsTrigger>
          <TabsTrigger value="test">Test ({filesByCategory.test.length})</TabsTrigger>
          <TabsTrigger value="doc">Doc ({filesByCategory.doc.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <FilePanel
            files={files}
            selectedFile={selectedFile}
            selectedFiles={selectedFiles}
            fileTree={fileTree}
            expandedFolders={expandedFolders}
            showExplanation={showExplanation}
            onSelectFile={setSelectedFile}
            onToggleFile={toggleFile}
            onToggleFolder={toggleFolder}
            onCopyCode={copyCode}
            onEdit={onEdit}
            onShowExplanation={() => setShowExplanation(!showExplanation)}
          />
        </TabsContent>

        {(['ui', 'api', 'db', 'test', 'doc'] as const).map((category) => (
          <TabsContent key={category} value={category} className="mt-4">
            <FilePanel
              files={filesByCategory[category]}
              selectedFile={selectedFile}
              selectedFiles={selectedFiles}
              fileTree={buildFileTree(filesByCategory[category])}
              expandedFolders={expandedFolders}
              showExplanation={showExplanation}
              onSelectFile={setSelectedFile}
              onToggleFile={toggleFile}
              onToggleFolder={toggleFolder}
              onCopyCode={copyCode}
              onEdit={onEdit}
              onShowExplanation={() => setShowExplanation(!showExplanation)}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-forge-taupe">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
          <span className="text-sm text-forge-beige self-center">
            {selectedFiles.size} / {files.length} selected
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDiscard}>
            Discard
          </Button>
          {onSaveForLater && (
            <Button variant="outline" onClick={handleSaveForLater}>
              Save for Later
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleApply}
            disabled={selectedFiles.size === 0}
          >
            Apply Selected ({selectedFiles.size})
          </Button>
          <Button onClick={handleApply} disabled={selectedFiles.size === 0}>
            Apply All
          </Button>
        </div>
      </div>
    </div>
  )
}

interface FilePanelProps {
  files: GeneratedFile[]
  selectedFile: GeneratedFile
  selectedFiles: Set<string>
  fileTree: FileTreeNode
  expandedFolders: Set<string>
  showExplanation: boolean
  onSelectFile: (file: GeneratedFile) => void
  onToggleFile: (path: string) => void
  onToggleFolder: (path: string) => void
  onCopyCode: (file: GeneratedFile) => void
  onEdit?: (file: GeneratedFile) => void
  onShowExplanation: () => void
}

function FilePanel({
  files,
  selectedFile,
  selectedFiles,
  fileTree,
  expandedFolders,
  showExplanation,
  onSelectFile,
  onToggleFile,
  onToggleFolder,
  onCopyCode,
  onEdit,
  onShowExplanation,
}: FilePanelProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-forge-beige">
        No files in this category
      </div>
    )
  }

  return (
    <div className="flex h-[600px] border border-forge-taupe rounded-lg overflow-hidden">
      {/* File Tree (Left - 30%) */}
      <div className="w-1/3 border-r border-forge-taupe p-4 overflow-y-auto bg-forge-charcoal/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-forge-cream text-sm">
            Files ({files.length})
          </h3>
        </div>

        <FileTreeView
          node={fileTree}
          selectedFile={selectedFile}
          selectedFiles={selectedFiles}
          expandedFolders={expandedFolders}
          onSelectFile={onSelectFile}
          onToggleFile={onToggleFile}
          onToggleFolder={onToggleFolder}
        />
      </div>

      {/* Code Preview (Right - 70%) */}
      <div className="flex-1 flex flex-col">
        {/* File Header */}
        <div className="border-b border-forge-taupe p-4 flex items-center justify-between bg-forge-charcoal/30">
          <div className="flex items-center gap-3">
            <FileIcon language={selectedFile.language} />
            <span className="font-mono text-sm text-forge-cream">
              {selectedFile.path}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyCode(selectedFile)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(selectedFile)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {selectedFile.explanation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowExplanation}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Why?
              </Button>
            )}
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-forge-charcoal/50">
          <SyntaxHighlighter
            language={selectedFile.language}
            style={oneDark}
            showLineNumbers
            customStyle={{
              background: 'transparent',
              margin: 0,
              padding: 0,
            }}
          >
            {selectedFile.content}
          </SyntaxHighlighter>
        </div>

        {/* Explanation (if visible) */}
        {showExplanation && selectedFile.explanation && (
          <div className="border-t border-forge-taupe p-4 bg-forge-taupe/20">
            <div className="flex items-center gap-2 text-xs text-forge-beige mb-2">
              <HelpCircle className="w-3 h-3" />
              <span>AI Explanation:</span>
            </div>
            <div className="text-sm text-forge-cream leading-relaxed">
              {selectedFile.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FileTreeView({
  node,
  selectedFile,
  selectedFiles,
  expandedFolders,
  onSelectFile,
  onToggleFile,
  onToggleFolder,
  level = 0,
}: {
  node: FileTreeNode
  selectedFile: GeneratedFile
  selectedFiles: Set<string>
  expandedFolders: Set<string>
  onSelectFile: (file: GeneratedFile) => void
  onToggleFile: (path: string) => void
  onToggleFolder: (path: string) => void
  level?: number
}) {
  if (node.type === 'file' && node.file) {
    const isSelected = selectedFile.path === node.path
    const isChecked = selectedFiles.has(node.path)

    return (
      <div
        className={cn(
          'flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-forge-taupe/20',
          isSelected && 'bg-forge-copper/10'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelectFile(node.file!)}
      >
        <Checkbox
          checked={isChecked}
          onCheckedChange={() => onToggleFile(node.path)}
          onClick={(e) => e.stopPropagation()}
        />
        <FileIcon language={node.file.language} />
        <span className={cn('text-sm', isSelected && 'text-forge-copper font-medium')}>
          {node.name}
        </span>
      </div>
    )
  }

  if (node.type === 'folder' && node.children) {
    const isExpanded = expandedFolders.has(node.path)

    return (
      <div>
        <div
          className="flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-forge-taupe/20"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => onToggleFolder(node.path)}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-forge-beige" />
          ) : (
            <ChevronRight className="w-4 h-4 text-forge-beige" />
          )}
          <Folder className="w-4 h-4 text-forge-copper" />
          <span className="text-sm text-forge-cream">{node.name}</span>
        </div>

        {isExpanded &&
          node.children.map((child) => (
            <FileTreeView
              key={child.path}
              node={child}
              selectedFile={selectedFile}
              selectedFiles={selectedFiles}
              expandedFolders={expandedFolders}
              onSelectFile={onSelectFile}
              onToggleFile={onToggleFile}
              onToggleFolder={onToggleFolder}
              level={level + 1}
            />
          ))}
      </div>
    )
  }

  return null
}

function FileIcon({ language }: { language: string }) {
  const colors: Record<string, string> = {
    typescript: 'text-blue-400',
    javascript: 'text-yellow-400',
    tsx: 'text-blue-300',
    jsx: 'text-yellow-300',
    css: 'text-purple-400',
    json: 'text-green-400',
    markdown: 'text-gray-400',
    sql: 'text-orange-400',
  }

  return <FileCode className={cn('w-4 h-4', colors[language] || 'text-forge-beige')} />
}

function buildFileTree(files: GeneratedFile[]): FileTreeNode {
  const root: FileTreeNode = {
    name: '/',
    path: '/',
    type: 'folder',
    children: [],
  }

  files.forEach((file) => {
    const parts = file.path.split('/').filter(Boolean)
    let current = root

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1
      const path = '/' + parts.slice(0, index + 1).join('/')

      if (!current.children) {
        current.children = []
      }

      let child = current.children.find((c) => c.name === part)

      if (!child) {
        child = {
          name: part,
          path,
          type: isLast ? 'file' : 'folder',
          children: isLast ? undefined : [],
          file: isLast ? file : undefined,
        }
        current.children.push(child)
      }

      current = child
    })
  })

  return root
}
