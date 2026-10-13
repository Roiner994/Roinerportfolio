# Graph Report - Roinerportfolio  (2026-10-12)

## Corpus Check
- 77 files · ~1,718,621 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 6, (none) 2, .example 1)

## Summary
- 617 nodes · 1072 edges · 53 communities (41 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eeae7479`
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
- lucide-react
- menubar.tsx
- HeroVariant3.tsx
- chat.ts
- context-menu.tsx
- dropdown-menu.tsx
- compilerOptions
- form.tsx
- carousel.tsx
- accordion.tsx
- sheet.tsx
- select.tsx
- chart.tsx
- drawer.tsx
- navigation-menu.tsx
- react
- utils.ts
- toggle-group.tsx
- vite.config.ts
- devDependencies
- scripts
- popover.tsx
- tabs.tsx
- useSidebar
- peerDependenciesMeta
- class-variance-authority
- avatar.tsx
- collapsible.tsx
- hover-card.tsx
- resizable.tsx
- alert.tsx
- sonner.tsx
- radio-group.tsx
- scroll-area.tsx
- graphify.sh
- projectMedia.ts
- pnpm
- peerDependencies
- @radix-ui/react-aspect-ratio
- TerminalHero.tsx
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 223 edges
2. `react` - 52 edges
3. `lucide-react` - 27 edges
4. `compilerOptions` - 15 edges
5. `buttonVariants` - 9 edges
6. `scripts` - 8 edges
7. `class-variance-authority` - 8 edges
8. `handler()` - 6 edges
9. `@radix-ui/react-slot` - 6 edges
10. `TerminalPanel()` - 6 edges

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

## Communities (53 total, 12 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.04
Nodes (56): dependencies, canvas-confetti, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, @emotion/react (+48 more)

### Community 1 - "sidebar.tsx"
Cohesion: 0.07
Nodes (30): @radix-ui/react-tooltip, Input(), Separator(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup() (+22 more)

### Community 2 - "portfolioProfile.ts"
Cohesion: 0.08
Nodes (28): aboutData, aboutDataEn, aboutDataEs, AboutProject, cvData, cvDataEn, cvDataEs, CvDownload (+20 more)

### Community 3 - "TerminalPanel.tsx"
Cohesion: 0.07
Nodes (20): ref_app_components_ui_use_mobile, ref_data_portfolioprofile, ref_lib_projectmedia, react-dom, allAutocompleteCommands, AVATAR_CHIP_COMMANDS, AVATAR_COMMAND_CONFIG, AVATAR_POSES (+12 more)

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

### Community 8 - "lucide-react"
Cohesion: 0.14
Nodes (12): lucide-react, ref_react_dom_client, App(), ContactSection(), HeroVariant3(), projects, ProjectsSection(), skillCategories (+4 more)

### Community 9 - "menubar.tsx"
Cohesion: 0.11
Nodes (12): @radix-ui/react-menubar, Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator() (+4 more)

### Community 10 - "HeroVariant3.tsx"
Cohesion: 0.19
Nodes (9): ref_lib_i18n_languagecontext, ref_motion_react, HeroNameTreatment(), LETTER_MAP, NeuralBackground(), Node, createAiWelcomeHistoryContext(), normalizePrompt() (+1 more)

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
Cohesion: 0.17
Nodes (13): @radix-ui/react-label, react-hook-form, FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext (+5 more)

### Community 16 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 17 - "accordion.tsx"
Cohesion: 0.15
Nodes (8): input-otp, @radix-ui/react-accordion, AccordionContent(), AccordionItem(), AccordionTrigger(), InputOTP(), InputOTPGroup(), InputOTPSlot()

### Community 18 - "sheet.tsx"
Cohesion: 0.17
Nodes (8): @radix-ui/react-dialog, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 19 - "select.tsx"
Cohesion: 0.17
Nodes (8): @radix-ui/react-select, SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 20 - "chart.tsx"
Cohesion: 0.23
Nodes (10): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload() (+2 more)

### Community 21 - "drawer.tsx"
Cohesion: 0.17
Nodes (7): vaul, DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 22 - "navigation-menu.tsx"
Cohesion: 0.20
Nodes (10): @radix-ui/react-navigation-menu, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger() (+2 more)

### Community 23 - "react"
Cohesion: 0.18
Nodes (6): @radix-ui/react-slider, @radix-ui/react-switch, react, Slider(), Switch(), Textarea()

### Community 24 - "utils.ts"
Cohesion: 0.22
Nodes (6): clsx, @radix-ui/react-checkbox, @radix-ui/react-progress, tailwind-merge, Checkbox(), Progress()

### Community 25 - "toggle-group.tsx"
Cohesion: 0.31
Nodes (7): @radix-ui/react-toggle, @radix-ui/react-toggle-group, ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

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

### Community 31 - "useSidebar"
Cohesion: 0.33
Nodes (6): Sidebar(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 32 - "peerDependenciesMeta"
Cohesion: 0.40
Nodes (5): peerDependenciesMeta, react, react-dom, optional, optional

### Community 33 - "class-variance-authority"
Cohesion: 0.50
Nodes (4): class-variance-authority, @radix-ui/react-slot, Badge(), badgeVariants

### Community 34 - "avatar.tsx"
Cohesion: 0.40
Nodes (4): @radix-ui/react-avatar, Avatar(), AvatarFallback(), AvatarImage()

### Community 37 - "resizable.tsx"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 38 - "alert.tsx"
Cohesion: 0.50
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 40 - "radio-group.tsx"
Cohesion: 0.50
Nodes (3): @radix-ui/react-radio-group, RadioGroup(), RadioGroupItem()

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
- **177 isolated node(s):** `ChatMessage`, `name`, `private`, `version`, `type` (+172 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 259 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `sidebar.tsx`, `portfolioProfile.ts`, `TerminalPanel.tsx`, `alert-dialog.tsx`, `cn`, `package.json`, `command.tsx`, `lucide-react`, `menubar.tsx`, `HeroVariant3.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `form.tsx`, `carousel.tsx`, `accordion.tsx`, `sheet.tsx`, `select.tsx`, `chart.tsx`, `drawer.tsx`, `navigation-menu.tsx`, `utils.ts`, `toggle-group.tsx`, `popover.tsx`, `tabs.tsx`, `class-variance-authority`, `avatar.tsx`, `hover-card.tsx`, `resizable.tsx`, `alert.tsx`, `radio-group.tsx`, `scroll-area.tsx`, `TerminalHero.tsx`?**
  _High betweenness centrality (0.300) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `sidebar.tsx`, `alert-dialog.tsx`, `command.tsx`, `menubar.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `form.tsx`, `carousel.tsx`, `accordion.tsx`, `sheet.tsx`, `select.tsx`, `chart.tsx`, `drawer.tsx`, `navigation-menu.tsx`, `react`, `utils.ts`, `toggle-group.tsx`, `popover.tsx`, `tabs.tsx`, `useSidebar`, `class-variance-authority`, `avatar.tsx`, `hover-card.tsx`, `resizable.tsx`, `alert.tsx`, `radio-group.tsx`, `scroll-area.tsx`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **What connects `ChatMessage`, `name`, `private` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03571428571428571 - nodes in this community are weakly interconnected._
- **Should `sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06984126984126984 - nodes in this community are weakly interconnected._
- **Should `portfolioProfile.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08387096774193549 - nodes in this community are weakly interconnected._