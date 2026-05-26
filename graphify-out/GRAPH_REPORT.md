# Graph Report - Roinerportfolio  (2026-05-13)

## Corpus Check
- 73 files · ~1,663,096 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 426 nodes · 734 edges · 30 communities (27 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `619cec84`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 223 edges
2. `buttonVariants` - 9 edges
3. `handler()` - 6 edges
4. `Button()` - 6 edges
5. `TerminalPanel()` - 6 edges
6. `resolveAppUrl()` - 5 edges
7. `fetchOpenRouterReply()` - 5 edges
8. `useSidebar()` - 5 edges
9. `useFormField()` - 5 edges
10. `useCarousel()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `buildSystemPrompt()` --calls--> `buildPortfolioKnowledgeContext()`  [INFERRED]
  api/chat.ts → src/data/portfolioProfile.ts
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/alert-dialog.tsx → src/app/components/ui/utils.ts
- `AlertDialogContent()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/alert-dialog.tsx → src/app/components/ui/utils.ts
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/alert-dialog.tsx → src/app/components/ui/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/app/components/ui/alert-dialog.tsx → src/app/components/ui/utils.ts

## Communities (30 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (69): Avatar(), AvatarFallback(), AvatarImage(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+61 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (32): ContactSection(), projects, ProjectsSection(), skillCategories, SkillsSection(), AboutData, aboutDataEn, aboutDataEs (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (20): HeroNameTreatment(), LETTER_MAP, HeroVariant3(), NeuralBackground(), Node, ChatMessage, ChatRole, commands (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (17): AccordionContent(), AccordionItem(), AccordionTrigger(), Badge(), badgeVariants, Checkbox(), HoverCardContent(), InputOTP() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (18): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay(), AlertDialogTitle() (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (14): Command(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut(), Dialog() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.2
Nodes (11): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (11): buildSystemPrompt(), ChatMessage, fetchOpenRouterReply(), getEnv(), handler(), isChatMessageArray(), isPublicHttpUrl(), normalizeHeaderValue() (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (8): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), THEMES, useChart()

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (6): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (7): SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.25
Nodes (6): BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 17 - "Community 17"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (4): Alert(), AlertDescription(), AlertTitle(), alertVariants

## Knowledge Gaps
- **58 isolated node(s):** `ChatMessage`, `skillCategories`, `TerminalHeroProps`, `projects`, `PaginationLinkProps` (+53 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`?**
  _High betweenness centrality (0.683) - this node is a cross-community bridge._
- **Why does `TerminalPanel()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.326) - this node is a cross-community bridge._
- **Why does `useIsMobile()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.321) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TerminalPanel()` (e.g. with `useLanguage()` and `useIsMobile()`) actually correct?**
  _`TerminalPanel()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ChatMessage`, `skillCategories`, `TerminalHeroProps` to the rest of the system?**
  _58 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._