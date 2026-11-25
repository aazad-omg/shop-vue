<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { cn } from '@/helpers'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Heading2, Italic, List, ListOrdered, Redo2, Strikethrough, Undo2 } from '@lucide/vue'
import { watch } from 'vue'

const props = defineProps<{ invalid?: boolean }>()
const model = defineModel<string>({ default: '' })

const editor = useEditor({
  content: model.value,
  extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
  editorProps: {
    attributes: {
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-label': 'Full description',
      class: 'rich-text min-h-40 px-3.5 py-3 text-sm text-stone-800 outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    // an empty editor stores '' instead of '<p></p>' so "required" works
    model.value = editor.isEmpty ? '' : editor.getHTML()
  },
})

// the product loads async in edit mode, so sync outside changes into the editor
watch(model, (value) => {
  if (editor.value && value !== editor.value.getHTML()) {
    editor.value.commands.setContent(value)
  }
})

const tools = [
  {
    label: 'Bold',
    icon: Bold,
    run: () => editor.value?.chain().focus().toggleBold().run(),
    active: () => editor.value?.isActive('bold'),
  },
  {
    label: 'Italic',
    icon: Italic,
    run: () => editor.value?.chain().focus().toggleItalic().run(),
    active: () => editor.value?.isActive('italic'),
  },
  {
    label: 'Strikethrough',
    icon: Strikethrough,
    run: () => editor.value?.chain().focus().toggleStrike().run(),
    active: () => editor.value?.isActive('strike'),
  },
  {
    label: 'Heading',
    icon: Heading2,
    run: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    active: () => editor.value?.isActive('heading', { level: 2 }),
  },
  {
    label: 'Bullet list',
    icon: List,
    run: () => editor.value?.chain().focus().toggleBulletList().run(),
    active: () => editor.value?.isActive('bulletList'),
  },
  {
    label: 'Numbered list',
    icon: ListOrdered,
    run: () => editor.value?.chain().focus().toggleOrderedList().run(),
    active: () => editor.value?.isActive('orderedList'),
  },
]
</script>

<template>
  <div
    :class="
      cn(
        'rounded-xl border border-stone-200 bg-white transition focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-stone-100',
        props.invalid && 'border-red-600',
      )
    "
  >
    <div class="flex flex-wrap items-center gap-1 border-b border-stone-200 p-1.5">
      <Button
        v-for="tool in tools"
        :key="tool.label"
        type="button"
        variant="ghost"
        size="icon-sm"
        :aria-label="tool.label"
        :title="tool.label"
        :aria-pressed="tool.active()"
        :class="tool.active() && 'bg-stone-200'"
        @click="tool.run()"
      >
        <component :is="tool.icon" />
      </Button>
      <span class="mx-1 h-5 w-px bg-stone-200" aria-hidden="true" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Undo"
        title="Undo"
        :disabled="!editor?.can().undo()"
        @click="editor?.chain().focus().undo().run()"
      >
        <Undo2 />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Redo"
        title="Redo"
        :disabled="!editor?.can().redo()"
        @click="editor?.chain().focus().redo().run()"
      >
        <Redo2 />
      </Button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>
