# Graph Report - Roinerportfolio  (2026-10-15)

## Corpus Check
- 79 files · ~1,727,554 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 6, (none) 2, .example 1)

## Summary
- 660 nodes · 1147 edges · 55 communities (43 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e6a74a0d`
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
- App.tsx
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
- tabs.tsx
- button.tsx
- peerDependenciesMeta
- HeroVideo.tsx
- avatar.tsx
- collapsible.tsx
- hover-card.tsx
- resizable.tsx
- HeroVariant3.tsx
- sonner.tsx
- react
- scroll-area.tsx
- graphify.sh
- projectMedia.ts
- pnpm
- peerDependencies
- @radix-ui/react-aspect-ratio
- useSidebar
- AGENTS.md
- alert.tsx
- TerminalHero.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 223 edges
2. `react` - 54 edges
3. `lucide-react` - 27 edges
4. `compilerOptions` - 15 edges
5. `TerminalPanel` - 13 edges
6. `buttonVariants` - 9 edges
7. `scripts` - 8 edges
8. `class-variance-authority` - 8 edges
9. `useHeroCrtTransition()` - 7 edges
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

## Communities (55 total, 12 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.04
Nodes (56): dependencies, canvas-confetti, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, @emotion/react (+48 more)

### Community 1 - "sidebar.tsx"
Cohesion: 0.07
Nodes (30): Button(), Input(), Separator(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup() (+22 more)

### Community 2 - "portfolioProfile.ts"
Cohesion: 0.07
Nodes (40): buildSystemPrompt(), ChatMessage, fetchOpenRouterReply(), getEnv(), handler(), isChatMessageArray(), isPublicHttpUrl(), normalizeHeaderValue() (+32 more)

### Community 3 - "TerminalPanel.tsx"
Cohesion: 0.07
Nodes (22): ref_app_components_ui_use_mobile, ref_data_portfolioprofile, ref_lib_projectmedia, react-dom, AgentId, allAutocompleteCommands, AVATAR_CHIP_COMMANDS, AVATAR_COMMAND_CONFIG (+14 more)

### Community 4 - "alert-dialog.tsx"
Cohesion: 0.09
Nodes (18): @radix-ui/react-alert-dialog, AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay() (+10 more)

### Community 5 - "cn"
Cohesion: 0.14
Nodes (22): BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator(), Card(), CardAction() (+14 more)

### Community 6 - "package.json"
Cohesion: 0.08
Nodes (24): name, private, type, version, canvas-confetti, date-fns, @emotion/react, @emotion/styled (+16 more)

### Community 7 - "command.tsx"
Cohesion: 0.11
Nodes (15): cmdk, Command(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut() (+7 more)

### Community 8 - "utils.ts"
Cohesion: 0.17
Nodes (8): clsx, @radix-ui/react-radio-group, @radix-ui/react-switch, tailwind-merge, RadioGroup(), RadioGroupItem(), Switch(), Textarea()

### Community 9 - "menubar.tsx"
Cohesion: 0.11
Nodes (12): @radix-ui/react-menubar, Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 10 - "accordion.tsx"
Cohesion: 0.33
Nodes (4): @radix-ui/react-accordion, AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 11 - "App.tsx"
Cohesion: 0.14
Nodes (10): ref_react_dom_client, App(), ContactSection(), projects, ProjectsSection(), skillCategories, SkillsSection(), TerminalOverlay() (+2 more)

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
Cohesion: 0.36
Nodes (4): lucide-react, ref_motion_react, NeuralBackground(), Node

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
Nodes (9): clamp01(), createAiWelcomeHistoryContext(), easeInOutSine(), easeOutCubic(), getMatchingAgentsForTech(), normalizePrompt(), renderExpProjectsCanvas(), smoothstep() (+1 more)

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

### Community 30 - "tabs.tsx"
Cohesion: 0.33
Nodes (5): @radix-ui/react-tabs, Tabs(), TabsContent(), TabsList(), TabsTrigger()

### Community 31 - "button.tsx"
Cohesion: 0.32
Nodes (5): class-variance-authority, @radix-ui/react-slot, react-day-picker, Badge(), badgeVariants

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

### Community 38 - "HeroVariant3.tsx"
Cohesion: 0.29
Nodes (4): ref_lib_i18n_languagecontext, HeroNameTreatment(), HeroNameTreatmentProps, LETTER_MAP

### Community 40 - "react"
Cohesion: 0.17
Nodes (7): @radix-ui/react-checkbox, @radix-ui/react-progress, @radix-ui/react-slider, react, Checkbox(), Progress(), Slider()

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

### Community 47 - "useSidebar"
Cohesion: 0.33
Nodes (6): Sidebar(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 53 - "alert.tsx"
Cohesion: 0.50
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

## Knowledge Gaps
- **198 isolated node(s):** `ChatMessage`, `name`, `private`, `version`, `type` (+193 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 280 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `sidebar.tsx`, `portfolioProfile.ts`, `TerminalPanel.tsx`, `alert-dialog.tsx`, `cn`, `package.json`, `command.tsx`, `utils.ts`, `menubar.tsx`, `accordion.tsx`, `App.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `form.tsx`, `carousel.tsx`, `input-otp.tsx`, `sheet.tsx`, `lucide-react`, `chart.tsx`, `drawer.tsx`, `toggle-group.tsx`, `select.tsx`, `navigation-menu.tsx`, `popover.tsx`, `tabs.tsx`, `button.tsx`, `HeroVideo.tsx`, `avatar.tsx`, `hover-card.tsx`, `resizable.tsx`, `HeroVariant3.tsx`, `scroll-area.tsx`, `alert.tsx`, `TerminalHero.tsx`?**
  _High betweenness centrality (0.352) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `sidebar.tsx`, `alert-dialog.tsx`, `command.tsx`, `utils.ts`, `menubar.tsx`, `accordion.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `form.tsx`, `carousel.tsx`, `input-otp.tsx`, `sheet.tsx`, `chart.tsx`, `drawer.tsx`, `toggle-group.tsx`, `select.tsx`, `navigation-menu.tsx`, `popover.tsx`, `tabs.tsx`, `button.tsx`, `avatar.tsx`, `hover-card.tsx`, `resizable.tsx`, `react`, `scroll-area.tsx`, `useSidebar`, `alert.tsx`?**
  _High betweenness centrality (0.217) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **What connects `ChatMessage`, `name`, `private` to the rest of the system?**
  _198 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03571428571428571 - nodes in this community are weakly interconnected._
- **Should `sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06984126984126984 - nodes in this community are weakly interconnected._
- **Should `portfolioProfile.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06976744186046512 - nodes in this community are weakly interconnected._