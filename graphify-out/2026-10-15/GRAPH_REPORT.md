# Graph Report - Roinerportfolio  (2026-10-15)

## Corpus Check
- 79 files · ~1,715,245 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 6, (none) 2, .example 1)

## Summary
- 651 nodes · 1131 edges · 49 communities (37 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `678f9a75`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- sidebar.tsx
- portfolioProfile.ts
- TerminalPanel.tsx
- alert-dialog.tsx
- cn
- package.json
- command.tsx
- utils.ts
- menubar.tsx
- accordion.tsx
- chat.ts
- context-menu.tsx
- dropdown-menu.tsx
- compilerOptions
- form.tsx
- carousel.tsx
- input-otp.tsx
- sheet.tsx
- switch.tsx
- chart.tsx
- drawer.tsx
- select.tsx
- radio-group.tsx
- navigation-menu.tsx
- vite.config.ts
- devDependencies
- scripts
- popover.tsx
- tabs.tsx
- peerDependenciesMeta
- HeroVideo.tsx
- avatar.tsx
- collapsible.tsx
- hover-card.tsx
- resizable.tsx
- sonner.tsx
- react
- scroll-area.tsx
- graphify.sh
- projectMedia.ts
- pnpm
- peerDependencies
- @radix-ui/react-aspect-ratio
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 223 edges
2. `react` - 54 edges
3. `lucide-react` - 27 edges
4. `compilerOptions` - 15 edges
5. `buttonVariants` - 9 edges
6. `scripts` - 8 edges
7. `class-variance-authority` - 8 edges
8. `useHeroCrtTransition()` - 7 edges
9. `TerminalPanel` - 7 edges
10. `handler()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `buildSystemPrompt()` --calls--> `buildPortfolioKnowledgeContext()`  [EXTRACTED]
  api/chat.ts → src/data/portfolioProfile.ts
- `AccordionItem()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/accordion.tsx → src/app/components/ui/utils.ts
- `AccordionTrigger()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/accordion.tsx → src/app/components/ui/utils.ts
- `AccordionContent()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/accordion.tsx → src/app/components/ui/utils.ts
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/alert-dialog.tsx → src/app/components/ui/utils.ts

## Import Cycles
- None detected.

## Communities (49 total, 12 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.04
Nodes (56): dependencies, canvas-confetti, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, @emotion/react (+48 more)

### Community 1 - "sidebar.tsx"
Cohesion: 0.06
Nodes (36): @radix-ui/react-tooltip, Input(), Separator(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter() (+28 more)

### Community 2 - "portfolioProfile.ts"
Cohesion: 0.05
Nodes (38): ref_react_dom_client, App(), ContactSection(), projects, ProjectsSection(), skillCategories, SkillsSection(), TerminalOverlay() (+30 more)

### Community 3 - "TerminalPanel.tsx"
Cohesion: 0.06
Nodes (31): ref_app_components_ui_use_mobile, ref_data_portfolioprofile, ref_lib_i18n_languagecontext, ref_lib_projectmedia, lucide-react, ref_motion_react, react-dom, HeroNameTreatment() (+23 more)

### Community 4 - "alert-dialog.tsx"
Cohesion: 0.10
Nodes (20): @radix-ui/react-alert-dialog, react-day-picker, AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+12 more)

### Community 5 - "cn"
Cohesion: 0.14
Nodes (22): BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator(), Card(), CardAction() (+14 more)

### Community 6 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, type, version, canvas-confetti, date-fns, @emotion/react, @emotion/styled (+15 more)

### Community 7 - "command.tsx"
Cohesion: 0.11
Nodes (15): cmdk, Command(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+7 more)

### Community 8 - "utils.ts"
Cohesion: 0.25
Nodes (5): clsx, @radix-ui/react-slider, tailwind-merge, Slider(), Textarea()

### Community 9 - "menubar.tsx"
Cohesion: 0.11
Nodes (12): @radix-ui/react-menubar, Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 10 - "accordion.tsx"
Cohesion: 0.33
Nodes (4): @radix-ui/react-accordion, AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 11 - "chat.ts"
Cohesion: 0.29
Nodes (12): buildSystemPrompt(), ChatMessage, fetchOpenRouterReply(), getEnv(), handler(), isChatMessageArray(), isPublicHttpUrl(), normalizeHeaderValue() (+4 more)

### Community 12 - "context-menu.tsx"
Cohesion: 0.12
Nodes (10): @radix-ui/react-context-menu, ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut() (+2 more)

### Community 13 - "dropdown-menu.tsx"
Cohesion: 0.12
Nodes (10): @radix-ui/react-dropdown-menu, DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+2 more)

### Community 14 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, esModuleInterop, isolatedModules, jsx, lib, module, moduleResolution (+8 more)

### Community 15 - "form.tsx"
Cohesion: 0.14
Nodes (16): @radix-ui/react-label, @radix-ui/react-slot, react-hook-form, Badge(), badgeVariants, FormControl(), FormDescription(), FormFieldContext (+8 more)

### Community 16 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 17 - "input-otp.tsx"
Cohesion: 0.33
Nodes (4): input-otp, InputOTP(), InputOTPGroup(), InputOTPSlot()

### Community 18 - "sheet.tsx"
Cohesion: 0.17
Nodes (8): @radix-ui/react-dialog, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 20 - "chart.tsx"
Cohesion: 0.23
Nodes (10): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload() (+2 more)

### Community 21 - "drawer.tsx"
Cohesion: 0.17
Nodes (7): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 23 - "select.tsx"
Cohesion: 0.17
Nodes (8): @radix-ui/react-select, SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 24 - "radio-group.tsx"
Cohesion: 0.50
Nodes (3): @radix-ui/react-radio-group, RadioGroup(), RadioGroupItem()

### Community 25 - "navigation-menu.tsx"
Cohesion: 0.10
Nodes (22): class-variance-authority, @radix-ui/react-navigation-menu, @radix-ui/react-toggle, @radix-ui/react-toggle-group, Alert(), AlertDescription(), AlertTitle(), alertVariants (+14 more)

### Community 26 - "vite.config.ts"
Cohesion: 0.25
Nodes (4): ref_path, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 27 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, tailwindcss, @tailwindcss/vite, @types/node, typescript, @vercel/node, vite, @vitejs/plugin-react

### Community 28 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, dev:vercel, graphify:detect, graphify:extract, graphify:init, graphify:update

### Community 30 - "tabs.tsx"
Cohesion: 0.33
Nodes (5): @radix-ui/react-tabs, Tabs(), TabsContent(), TabsList(), TabsTrigger()

### Community 32 - "peerDependenciesMeta"
Cohesion: 0.40
Nodes (5): peerDependenciesMeta, react, react-dom, optional, optional

### Community 33 - "HeroVideo.tsx"
Cohesion: 0.08
Nodes (33): Box, boxStyle(), clamp01(), CLAUDE_HEAD, CLAUDE_HEAD_LEFT, CRT, CRT_COMMAND, easeInOut() (+25 more)

### Community 34 - "avatar.tsx"
Cohesion: 0.40
Nodes (4): @radix-ui/react-avatar, Avatar(), AvatarFallback(), AvatarImage()

### Community 37 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 40 - "react"
Cohesion: 0.22
Nodes (5): @radix-ui/react-checkbox, @radix-ui/react-progress, react, Checkbox(), Progress()

### Community 41 - "scroll-area.tsx"
Cohesion: 0.50
Nodes (3): @radix-ui/react-scroll-area, ScrollArea(), ScrollBar()

### Community 42 - "graphify.sh"
Cohesion: 0.83
Nodes (3): init_graphify(), resolve_python(), graphify.sh script

### Community 44 - "pnpm"
Cohesion: 0.67
Nodes (3): vite, pnpm, overrides

### Community 45 - "peerDependencies"
Cohesion: 0.67
Nodes (3): peerDependencies, react, react-dom

## Knowledge Gaps
- **195 isolated node(s):** `ChatMessage`, `name`, `private`, `version`, `type` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 277 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `sidebar.tsx`, `portfolioProfile.ts`, `TerminalPanel.tsx`, `alert-dialog.tsx`, `cn`, `package.json`, `command.tsx`, `utils.ts`, `menubar.tsx`, `accordion.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `form.tsx`, `carousel.tsx`, `input-otp.tsx`, `sheet.tsx`, `switch.tsx`, `chart.tsx`, `drawer.tsx`, `select.tsx`, `radio-group.tsx`, `navigation-menu.tsx`, `popover.tsx`, `tabs.tsx`, `HeroVideo.tsx`, `avatar.tsx`, `hover-card.tsx`, `resizable.tsx`, `scroll-area.tsx`?**
  _High betweenness centrality (0.349) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `sidebar.tsx`, `alert-dialog.tsx`, `command.tsx`, `utils.ts`, `menubar.tsx`, `accordion.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `form.tsx`, `carousel.tsx`, `input-otp.tsx`, `sheet.tsx`, `switch.tsx`, `chart.tsx`, `drawer.tsx`, `select.tsx`, `radio-group.tsx`, `navigation-menu.tsx`, `popover.tsx`, `tabs.tsx`, `avatar.tsx`, `hover-card.tsx`, `resizable.tsx`, `react`, `scroll-area.tsx`?**
  _High betweenness centrality (0.223) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **What connects `ChatMessage`, `name`, `private` to the rest of the system?**
  _195 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03571428571428571 - nodes in this community are weakly interconnected._
- **Should `sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06387921022067364 - nodes in this community are weakly interconnected._
- **Should `portfolioProfile.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0549645390070922 - nodes in this community are weakly interconnected._