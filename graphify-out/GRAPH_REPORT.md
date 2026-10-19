# Graph Report - Roinerportfolio  (2026-10-19)

## Corpus Check
- 84 files · ~2,024,411 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: .css 7, (none) 2, .example 1)

## Summary
- 748 nodes · 1293 edges · 55 communities (44 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `34ca3e8f`
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
- projectsContactTransition.ts
- context-menu.tsx
- dropdown-menu.tsx
- compilerOptions
- form.tsx
- carousel.tsx
- input-otp.tsx
- sheet.tsx
- lucide-react
- chart.tsx
- drawer.tsx
- toggle-group.tsx
- select.tsx
- TerminalPanel
- navigation-menu.tsx
- vite.config.ts
- devDependencies
- scripts
- popover.tsx
- expProjectsTransition.ts
- class-variance-authority
- peerDependenciesMeta
- HeroVideo.tsx
- chat.ts
- collapsible.tsx
- hover-card.tsx
- resizable.tsx
- AiTerminalView.tsx
- sonner.tsx
- react
- scroll-area.tsx
- graphify.sh
- projectMedia.ts
- pnpm
- peerDependencies
- @radix-ui/react-aspect-ratio
- contactAiTransition.ts
- AGENTS.md
- switch.tsx
- Box

## God Nodes (most connected - your core abstractions)
1. `cn()` - 223 edges
2. `react` - 56 edges
3. `lucide-react` - 27 edges
4. `TerminalPanel` - 16 edges
5. `runProjectsContactTransition()` - 15 edges
6. `compilerOptions` - 15 edges
7. `runExpProjectsTransition()` - 11 edges
8. `runContactAiTransition()` - 9 edges
9. `buttonVariants` - 9 edges
10. `scripts` - 8 edges

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

## Communities (55 total, 11 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.04
Nodes (56): dependencies, canvas-confetti, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, @emotion/react (+48 more)

### Community 1 - "sidebar.tsx"
Cohesion: 0.06
Nodes (36): @radix-ui/react-tooltip, Input(), Separator(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter() (+28 more)

### Community 2 - "portfolioProfile.ts"
Cohesion: 0.05
Nodes (40): ref_react_dom_client, App(), ContactSection(), projects, ProjectsSection(), skillCategories, SkillsSection(), TerminalOverlay() (+32 more)

### Community 3 - "TerminalPanel.tsx"
Cohesion: 0.06
Nodes (24): ref_app_components_ui_use_mobile, ref_data_portfolioprofile, ref_lib_projectmedia, react-dom, AgentId, AI_SLASH_COMMANDS, allAutocompleteCommands, AVATAR_COMMAND_CONFIG (+16 more)

### Community 4 - "alert-dialog.tsx"
Cohesion: 0.10
Nodes (20): @radix-ui/react-alert-dialog, react-day-picker, AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+12 more)

### Community 5 - "cn"
Cohesion: 0.10
Nodes (31): @radix-ui/react-avatar, @radix-ui/react-tabs, Avatar(), AvatarFallback(), AvatarImage(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+23 more)

### Community 6 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, type, version, canvas-confetti, date-fns, @emotion/react, @emotion/styled (+15 more)

### Community 7 - "command.tsx"
Cohesion: 0.11
Nodes (15): cmdk, Command(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+7 more)

### Community 8 - "utils.ts"
Cohesion: 0.18
Nodes (7): clsx, @radix-ui/react-progress, @radix-ui/react-slider, tailwind-merge, Progress(), Slider(), Textarea()

### Community 9 - "menubar.tsx"
Cohesion: 0.11
Nodes (12): @radix-ui/react-menubar, Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 10 - "accordion.tsx"
Cohesion: 0.33
Nodes (4): @radix-ui/react-accordion, AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 11 - "projectsContactTransition.ts"
Cohesion: 0.19
Nodes (20): bakeGlitch(), Box, canvas(), clamp01(), decodedImgs, easeInOutCubic(), easeOutCubic(), finalBox() (+12 more)

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
Cohesion: 0.17
Nodes (13): @radix-ui/react-label, react-hook-form, FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext (+5 more)

### Community 16 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 17 - "input-otp.tsx"
Cohesion: 0.33
Nodes (4): input-otp, InputOTP(), InputOTPGroup(), InputOTPSlot()

### Community 18 - "sheet.tsx"
Cohesion: 0.17
Nodes (8): @radix-ui/react-dialog, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 19 - "lucide-react"
Cohesion: 0.29
Nodes (5): ref_lib_i18n_languagecontext, lucide-react, ref_motion_react, NeuralBackground(), Node

### Community 20 - "chart.tsx"
Cohesion: 0.23
Nodes (10): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload() (+2 more)

### Community 21 - "drawer.tsx"
Cohesion: 0.17
Nodes (7): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 22 - "toggle-group.tsx"
Cohesion: 0.31
Nodes (7): @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 23 - "select.tsx"
Cohesion: 0.17
Nodes (8): @radix-ui/react-select, SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 24 - "TerminalPanel"
Cohesion: 0.25
Nodes (9): clamp01(), createAiWelcomeHistoryContext(), easeInOutSine(), getMatchingAgentsForTech(), isCoarsePointer(), normalizePrompt(), rectOf(), smoothstep() (+1 more)

### Community 25 - "navigation-menu.tsx"
Cohesion: 0.20
Nodes (10): @radix-ui/react-navigation-menu, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger() (+2 more)

### Community 26 - "vite.config.ts"
Cohesion: 0.25
Nodes (4): ref_path, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 27 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, tailwindcss, @tailwindcss/vite, @types/node, typescript, @vercel/node, vite, @vitejs/plugin-react

### Community 28 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, dev:vercel, graphify:detect, graphify:extract, graphify:init, graphify:update

### Community 30 - "expProjectsTransition.ts"
Cohesion: 0.19
Nodes (15): cellHash(), clamp01(), easeInOutSine(), easeOutBack(), easeOutCubic(), EXP_PROJECTS_DURATION_MS, EXP_PROJECTS_REDUCED_MS, EXP_PROJECTS_TIMELINE (+7 more)

### Community 31 - "class-variance-authority"
Cohesion: 0.24
Nodes (8): class-variance-authority, @radix-ui/react-slot, Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants

### Community 32 - "peerDependenciesMeta"
Cohesion: 0.40
Nodes (5): peerDependenciesMeta, react, react-dom, optional, optional

### Community 33 - "HeroVideo.tsx"
Cohesion: 0.08
Nodes (34): Box, boxStyle(), clamp01(), CLAUDE_HEAD, CLAUDE_HEAD_LEFT, CRT, CRT_COMMAND, easeInOut() (+26 more)

### Community 34 - "chat.ts"
Cohesion: 0.29
Nodes (12): buildSystemPrompt(), ChatMessage, fetchOpenRouterReply(), getEnv(), handler(), isChatMessageArray(), isPublicHttpUrl(), normalizeHeaderValue() (+4 more)

### Community 37 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 38 - "AiTerminalView.tsx"
Cohesion: 0.08
Nodes (25): Agent, AGENTS, AiAgentsCrew(), AiAgentsCrewProps, ensureGlobalStyle(), ENTRANCE_ORDER, Eye, fireBeam() (+17 more)

### Community 40 - "react"
Cohesion: 0.15
Nodes (7): @radix-ui/react-checkbox, @radix-ui/react-radio-group, react, TerminalHeroProps, Checkbox(), RadioGroup(), RadioGroupItem()

### Community 41 - "scroll-area.tsx"
Cohesion: 0.50
Nodes (3): @radix-ui/react-scroll-area, ScrollArea(), ScrollBar()

### Community 42 - "graphify.sh"
Cohesion: 0.83
Nodes (3): init_graphify(), resolve_python(), graphify.sh script

### Community 43 - "projectMedia.ts"
Cohesion: 0.40
Nodes (5): getProjectMedia(), normalizeMediaFileName(), ProjectImage, projectMedia, ProjectMediaCaption

### Community 44 - "pnpm"
Cohesion: 0.67
Nodes (3): vite, pnpm, overrides

### Community 45 - "peerDependencies"
Cohesion: 0.67
Nodes (3): peerDependencies, react, react-dom

### Community 47 - "contactAiTransition.ts"
Cohesion: 0.24
Nodes (12): CaBox, clamp01(), CONTACT_AI_TIMELINE, easeInCubic(), easeInOutCubic(), easeOutCubic(), lerp(), RunContactAiOptions (+4 more)

### Community 54 - "Box"
Cohesion: 0.67
Nodes (3): Box, PanelKey, ExpProjectsSnapshot

## Knowledge Gaps
- **234 isolated node(s):** `ChatMessage`, `name`, `private`, `version`, `type` (+229 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 319 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `sidebar.tsx`, `portfolioProfile.ts`, `TerminalPanel.tsx`, `alert-dialog.tsx`, `cn`, `package.json`, `command.tsx`, `utils.ts`, `menubar.tsx`, `accordion.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `form.tsx`, `carousel.tsx`, `input-otp.tsx`, `sheet.tsx`, `lucide-react`, `chart.tsx`, `drawer.tsx`, `toggle-group.tsx`, `select.tsx`, `navigation-menu.tsx`, `popover.tsx`, `class-variance-authority`, `HeroVideo.tsx`, `hover-card.tsx`, `resizable.tsx`, `AiTerminalView.tsx`, `scroll-area.tsx`, `switch.tsx`?**
  _High betweenness centrality (0.396) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `sidebar.tsx`, `alert-dialog.tsx`, `command.tsx`, `utils.ts`, `menubar.tsx`, `accordion.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `form.tsx`, `carousel.tsx`, `input-otp.tsx`, `sheet.tsx`, `chart.tsx`, `drawer.tsx`, `toggle-group.tsx`, `select.tsx`, `navigation-menu.tsx`, `popover.tsx`, `class-variance-authority`, `hover-card.tsx`, `resizable.tsx`, `react`, `scroll-area.tsx`, `switch.tsx`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **What connects `ChatMessage`, `name`, `private` to the rest of the system?**
  _234 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03571428571428571 - nodes in this community are weakly interconnected._
- **Should `sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06387921022067364 - nodes in this community are weakly interconnected._
- **Should `portfolioProfile.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.052244897959183675 - nodes in this community are weakly interconnected._