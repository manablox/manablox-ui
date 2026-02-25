import type { AttributeConverter, SelectionMode, TreeNode } from '../../core/types.js';
import { MbBaseComponent } from '../../core/MbBaseComponent.js';
import { createDefine } from '../../core/define.js';
import { TREE_STYLES } from './Tree.styles.js';

type TreeSelectionState = Record<string, true | false | 'partial'>;
type TreeExpandedState = Record<string, boolean>;

interface NodeMeta {
	key: string;
	node: TreeNode;
	parentKey: string | null;
	level: number;
	childrenKeys: string[];
}

interface RenderNode {
	key: string;
	node: TreeNode;
	parentKey: string | null;
	level: number;
	hasChildren: boolean;
	expanded: boolean;
	selected: boolean;
	partial: boolean;
	highlighted: boolean;
	focused: boolean;
	childrenHtml: string;
}

function asNodes(input: unknown): TreeNode[] {
	if (!Array.isArray(input)) return [];
	return input.filter((item): item is TreeNode => typeof item === 'object' && item !== null);
}

export class MbTree extends MbBaseComponent {
	static readonly _componentName = 'mb-tree';
	static readonly _componentStyles = TREE_STYLES;

	protected static get attributeConverters(): Map<string, AttributeConverter> {
		return new Map([
			['value', 'object'],
			['selection-mode', 'string'],
			['selection-keys', 'object'],
			['expanded-keys', 'object'],
			['filter', 'boolean'],
			['filter-placeholder', 'string'],
			['filter-mode', 'string'],
			['loading', 'boolean'],
			['load-on-demand', 'boolean'],
			['scroll-height', 'string'],
			['empty-message', 'string'],
			['drag-drop-scope', 'string'],
		]);
	}

	static get observedAttributes(): string[] {
		return Array.from(MbTree.attributeConverters.keys());
	}

	#listenersBound = false;
	#filterValue = '';
	#focusedKey: string | null = null;
	#draggingKey: string | null = null;
	#metaMap = new Map<string, NodeMeta>();
	#visibleKeys: string[] = [];

	connectedCallback(): void {
		super.connectedCallback();
		if (this.#listenersBound) return;
		this.#listenersBound = true;

		const onClick = (event: Event) => this.#onClick(event);
		const onInput = (event: Event) => this.#onInput(event);
		const onKeydown = (event: KeyboardEvent) => this.#onKeydown(event);
		const onDragStart = (event: DragEvent) => this.#onDragStart(event);
		const onDragOver = (event: DragEvent) => this.#onDragOver(event);
		const onDrop = (event: DragEvent) => this.#onDrop(event);

		this.addEventListener('click', onClick);
		this.addEventListener('input', onInput);
		this.addEventListener('keydown', onKeydown);
		this.addEventListener('dragstart', onDragStart);
		this.addEventListener('dragover', onDragOver);
		this.addEventListener('drop', onDrop);

		this._addCleanup(() => this.removeEventListener('click', onClick));
		this._addCleanup(() => this.removeEventListener('input', onInput));
		this._addCleanup(() => this.removeEventListener('keydown', onKeydown));
		this._addCleanup(() => this.removeEventListener('dragstart', onDragStart));
		this._addCleanup(() => this.removeEventListener('dragover', onDragOver));
		this._addCleanup(() => this.removeEventListener('drop', onDrop));
	}

	get value(): TreeNode[] {
		return asNodes(this._obj<unknown>('value'));
	}
	set value(next: TreeNode[]) {
		this.setAttribute('value', JSON.stringify(next ?? []));
	}

	get selectionMode(): SelectionMode | null {
		const value = this._str('selection-mode', '');
		return value === 'single' || value === 'multiple' || value === 'checkbox' ? value : null;
	}

	get selectionKeys(): TreeSelectionState {
		return this._obj<TreeSelectionState>('selection-keys') ?? {};
	}
	set selectionKeys(next: TreeSelectionState) {
		this.setAttribute('selection-keys', JSON.stringify(next ?? {}));
	}

	get expandedKeys(): TreeExpandedState {
		return this._obj<TreeExpandedState>('expanded-keys') ?? {};
	}
	set expandedKeys(next: TreeExpandedState) {
		this.setAttribute('expanded-keys', JSON.stringify(next ?? {}));
	}

	get filter(): boolean {
		return this._bool('filter');
	}

	get filterMode(): 'lenient' | 'strict' {
		return this._str('filter-mode', 'lenient') === 'strict' ? 'strict' : 'lenient';
	}

	get loading(): boolean {
		return this._bool('loading');
	}

	get loadOnDemand(): boolean {
		return this._bool('load-on-demand');
	}

	get dragDropScope(): string {
		return this._str('drag-drop-scope', '');
	}

	protected _render(): string {
		this.#buildMetaMap();
		const filtered = this.#filterNodes(this.value, 'root');
		this.#visibleKeys = [];
		const rootHtml = filtered
			.map((node, index) => this.#renderNode(node, String(index), null, 1))
			.join('');

		if (!this.#focusedKey && this.#visibleKeys.length) {
			this.#focusedKey = this.#visibleKeys[0] ?? null;
		}

		const scrollHeight = this._escape(this._str('scroll-height', '20rem'));
		const emptyMessage = this._escape(this._str('empty-message', 'No records found'));

		return this._html`
			<div class="mb-tree">
				${
					this.filter
						? `<div class="mb-tree-filter-container"><input type="text" value="${this._escape(this.#filterValue)}" placeholder="${this._escape(this._str('filter-placeholder', 'Filter'))}" aria-label="Filter tree" /></div>`
						: ''
				}
				<div class="mb-tree-container" style="max-height:${scrollHeight}">
					${this.loading ? '<div class="mb-tree-loading-overlay" aria-live="polite">Loading...</div>' : ''}
					<div role="tree" aria-busy="${this.loading ? 'true' : 'false'}" tabindex="0" class="mb-tree-tree" aria-multiselectable="${this.selectionMode === 'multiple' || this.selectionMode === 'checkbox' ? 'true' : 'false'}">
						${rootHtml ? `<ul class="mb-tree-root">${rootHtml}</ul>` : `<div class="mb-tree-empty">${emptyMessage}</div>`}
					</div>
				</div>
			</div>
		`;
	}

	#renderNode(node: TreeNode, key: string, parentKey: string | null, level: number): string {
		const children = this.#childrenOf(node);
		const hasChildren = children.length > 0 || node.leaf === false;
		const expanded = Boolean(this.expandedKeys[key] || node.expanded);
		const selection = this.selectionKeys;
		const selected = selection[key] === true;
		const partial = selection[key] === 'partial';
		const highlighted = this.#focusedKey === key;
		const focused = this.#focusedKey === key;
		this.#visibleKeys.push(key);

		const renderNode: RenderNode = {
			key,
			node,
			parentKey,
			level,
			hasChildren,
			expanded,
			selected,
			partial,
			highlighted,
			focused,
			childrenHtml:
				hasChildren && expanded
					? children.map((child, index) => this.#renderNode(child, `${key}-${index}`, key, level + 1)).join('')
					: '',
		};

		const contentClasses = [
			'mb-tree-node-content',
			renderNode.selected ? 'mb-tree-node-selected' : '',
			renderNode.focused ? 'mb-tree-node-focus' : '',
			renderNode.highlighted ? 'mb-tree-node-highlighted' : '',
		]
			.filter(Boolean)
			.join(' ');

		const icon = typeof node.icon === 'string' && node.icon.trim() ? node.icon.trim() : '•';
		const draggable = this.dragDropScope ? 'draggable="true"' : '';

		return this._html`
			<li class="mb-tree-node" role="none" data-key="${this._escape(renderNode.key)}" data-parent-key="${this._escape(renderNode.parentKey ?? '')}" ${draggable}>
				<div
					class="${contentClasses}"
					data-node-content
					data-key="${this._escape(renderNode.key)}"
					role="treeitem"
					aria-level="${renderNode.level}"
					aria-expanded="${renderNode.hasChildren ? String(renderNode.expanded) : 'false'}"
					aria-selected="${renderNode.selected ? 'true' : 'false'}"
					tabindex="${renderNode.focused ? '0' : '-1'}"
					style="padding-inline-start: calc((var(--mb-tree-node-indent, 1rem)) * ${Math.max(0, renderNode.level - 1)});"
				>
					<button class="mb-tree-node-toggler" type="button" data-action="toggle" data-key="${this._escape(renderNode.key)}" ${renderNode.hasChildren ? '' : 'disabled'} aria-label="Toggle node">${renderNode.expanded ? '▾' : '▸'}</button>
					${
						this.selectionMode === 'checkbox'
							? `<input class="mb-tree-node-checkbox" type="checkbox" data-action="checkbox" data-key="${this._escape(renderNode.key)}" ${renderNode.selected ? 'checked' : ''} ${renderNode.partial ? 'data-partial="true"' : ''} aria-label="Select node" />`
							: ''
					}
					<span class="mb-tree-node-icon">${this._escape(icon)}</span>
					<span class="mb-tree-node-label">${this._escape(node.label ?? renderNode.key)}</span>
				</div>
				${
					renderNode.hasChildren
						? `<ul class="mb-tree-node-children" role="group" ${renderNode.expanded ? '' : 'hidden'}>${renderNode.childrenHtml}</ul>`
						: ''
				}
			</li>
		`;
	}

	protected _afterRender(): void {
		const partialBoxes = this._qsa<HTMLInputElement>('.mb-tree-node-checkbox[data-partial="true"]');
		partialBoxes.forEach(box => {
			box.indeterminate = true;
		});
	}

	#onInput(event: Event): void {
		const target = event.target as HTMLElement;
		if (target.matches('.mb-tree-filter-container input')) {
			this.#filterValue = (target as HTMLInputElement).value;
			this.emit('mb-filter', { filter: this.#filterValue });
			this._scheduleRender();
			return;
		}

		if (target.matches('[data-action="checkbox"]')) {
			const key = target.getAttribute('data-key');
			if (!key) return;
			this.#toggleCheckboxSelection(key);
		}
	}

	#onClick(event: Event): void {
		const target = event.target as HTMLElement;

		const toggler = target.closest<HTMLElement>('[data-action="toggle"]');
		if (toggler) {
			const key = toggler.getAttribute('data-key');
			if (key) this.#toggleExpand(key);
			return;
		}

		const content = target.closest<HTMLElement>('[data-node-content]');
		if (!content) return;
		const key = content.getAttribute('data-key');
		if (!key) return;
		this.#focusedKey = key;
		if (this.selectionMode === 'single' || this.selectionMode === 'multiple') {
			const mouseEvent = event as MouseEvent;
			this.#toggleSelection(key, Boolean(mouseEvent.ctrlKey || mouseEvent.metaKey));
		} else {
			this._scheduleRender();
		}
	}

	#onKeydown(event: KeyboardEvent): void {
		const tree = (event.target as HTMLElement).closest('.mb-tree-tree');
		if (!tree || this.#visibleKeys.length === 0) return;

		const currentIndex = this.#focusedKey ? this.#visibleKeys.indexOf(this.#focusedKey) : -1;
		const activeKey = currentIndex >= 0 ? this.#visibleKeys[currentIndex] : this.#visibleKeys[0] ?? null;
		if (!activeKey) return;

		switch (event.key) {
			case 'ArrowDown': {
				event.preventDefault();
				const next = this.#visibleKeys[Math.min(this.#visibleKeys.length - 1, Math.max(0, currentIndex + 1))];
				if (next) this.#focusKey(next);
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				const prev = this.#visibleKeys[Math.max(0, currentIndex - 1)];
				if (prev) this.#focusKey(prev);
				break;
			}
			case 'ArrowRight': {
				event.preventDefault();
				const meta = this.#metaMap.get(activeKey);
				if (!meta) break;
				if (meta.childrenKeys.length && !this.expandedKeys[activeKey]) {
					this.#toggleExpand(activeKey);
				} else if (meta.childrenKeys.length) {
					this.#focusKey(meta.childrenKeys[0] ?? activeKey);
				}
				break;
			}
			case 'ArrowLeft': {
				event.preventDefault();
				const meta = this.#metaMap.get(activeKey);
				if (!meta) break;
				if (this.expandedKeys[activeKey]) {
					this.#toggleExpand(activeKey);
				} else if (meta.parentKey) {
					this.#focusKey(meta.parentKey);
				}
				break;
			}
			case 'Enter': {
				event.preventDefault();
				if (this.selectionMode === 'single' || this.selectionMode === 'multiple') {
					this.#toggleSelection(activeKey, event.ctrlKey || event.metaKey);
				}
				break;
			}
			case ' ': {
				event.preventDefault();
				if (this.selectionMode === 'checkbox') {
					this.#toggleCheckboxSelection(activeKey);
				}
				break;
			}
			default:
				break;
		}
	}

	#toggleExpand(key: string): void {
		const expanded = { ...this.expandedKeys };
		if (expanded[key]) {
			delete expanded[key];
			this.emit('mb-node-collapse', { key, node: this.#metaMap.get(key)?.node ?? null });
		} else {
			expanded[key] = true;
			const node = this.#metaMap.get(key)?.node;
			this.emit('mb-node-expand', { key, node: node ?? null, lazy: this.loadOnDemand && this.#childrenOf(node).length === 0 });
		}
		this.expandedKeys = expanded;
		this._scheduleRender();
	}

	#toggleSelection(key: string, metaKey: boolean): void {
		const node = this.#metaMap.get(key)?.node;
		if (node?.selectable === false) return;

		if (this.selectionMode === 'single') {
			const isSelected = this.selectionKeys[key] === true;
			const next: TreeSelectionState = isSelected ? {} : { [key]: true };
			this.selectionKeys = next;
			this.emit(isSelected ? 'mb-node-unselect' : 'mb-node-select', { key, node: node ?? null });
			this.emit('mb-selection-change', { keys: next });
			this._scheduleRender();
			return;
		}

		const current = { ...this.selectionKeys };
		if (!metaKey) {
			const wasSelected = current[key] === true;
			const next: TreeSelectionState = wasSelected ? {} : { [key]: true };
			this.selectionKeys = next;
			this.emit(wasSelected ? 'mb-node-unselect' : 'mb-node-select', { key, node: node ?? null });
			this.emit('mb-selection-change', { keys: next });
			this._scheduleRender();
			return;
		}

		if (current[key] === true) {
			delete current[key];
			this.emit('mb-node-unselect', { key, node: node ?? null });
		} else {
			current[key] = true;
			this.emit('mb-node-select', { key, node: node ?? null });
		}

		this.selectionKeys = current;
		this.emit('mb-selection-change', { keys: current });
		this._scheduleRender();
	}

	#toggleCheckboxSelection(key: string): void {
		const current = { ...this.selectionKeys };
		const targetSelected = current[key] !== true;
		const descendants = this.#collectDescendants(key);
		const all = [key, ...descendants];

		all.forEach(nodeKey => {
			if (targetSelected) current[nodeKey] = true;
			else delete current[nodeKey];
		});

		this.#updateAncestorCheckboxState(key, current);
		this.selectionKeys = current;
		this.emit(targetSelected ? 'mb-node-select' : 'mb-node-unselect', { key, node: this.#metaMap.get(key)?.node ?? null });
		this.emit('mb-selection-change', { keys: current });
		this._scheduleRender();
	}

	#updateAncestorCheckboxState(fromKey: string, state: TreeSelectionState): void {
		let parent = this.#metaMap.get(fromKey)?.parentKey ?? null;
		while (parent) {
			const childKeys = this.#metaMap.get(parent)?.childrenKeys ?? [];
			const allSelected = childKeys.length > 0 && childKeys.every(key => state[key] === true);
			const anySelected = childKeys.some(key => state[key] === true || state[key] === 'partial');

			if (allSelected) state[parent] = true;
			else if (anySelected) state[parent] = 'partial';
			else delete state[parent];

			parent = this.#metaMap.get(parent)?.parentKey ?? null;
		}
	}

	#focusKey(key: string): void {
		this.#focusedKey = key;
		this._scheduleRender();
	}

	#collectDescendants(key: string): string[] {
		const result: string[] = [];
		const stack = [...(this.#metaMap.get(key)?.childrenKeys ?? [])];
		while (stack.length) {
			const next = stack.pop();
			if (!next) continue;
			result.push(next);
			stack.push(...(this.#metaMap.get(next)?.childrenKeys ?? []));
		}
		return result;
	}

	#buildMetaMap(): void {
		this.#metaMap.clear();
		const walk = (nodes: TreeNode[], parentKey: string | null, level: number, path: string): void => {
			nodes.forEach((node, index) => {
				const key = `${path}${index}`;
				const children = this.#childrenOf(node);
				const childKeys = children.map((_, childIndex) => `${key}-${childIndex}`);
				this.#metaMap.set(key, {
					key,
					node,
					parentKey,
					level,
					childrenKeys: childKeys,
				});
				if (children.length) {
					walk(children, key, level + 1, `${key}-`);
				}
			});
		};
		walk(this.value, null, 1, '');
	}

	#childrenOf(node: TreeNode | undefined): TreeNode[] {
		if (!node || !Array.isArray(node.children)) return [];
		return node.children.filter((item): item is TreeNode => typeof item === 'object' && item !== null);
	}

	#matchesFilter(node: TreeNode): boolean {
		if (!this.#filterValue.trim()) return true;
		const value = String(node.label ?? '').toLowerCase();
		return value.includes(this.#filterValue.trim().toLowerCase());
	}

	#filterNodes(nodes: TreeNode[], path: string): TreeNode[] {
		if (!this.#filterValue.trim()) return nodes;
		const mode = this.filterMode;
		const result: TreeNode[] = [];

		nodes.forEach((node, index) => {
			const key = `${path === 'root' ? '' : `${path}-`}${index}`;
			const children = this.#childrenOf(node);
			const selfMatch = this.#matchesFilter(node);

			if (mode === 'lenient' && selfMatch) {
				result.push(node);
				return;
			}

			const filteredChildren = this.#filterNodes(children, key);
			if (selfMatch || filteredChildren.length) {
				result.push({ ...node, children: filteredChildren });
			}
		});

		return result;
	}

	#onDragStart(event: DragEvent): void {
		if (!this.dragDropScope) return;
		const row = (event.target as HTMLElement).closest<HTMLElement>('.mb-tree-node');
		const key = row?.getAttribute('data-key');
		if (!key || !event.dataTransfer) return;
		this.#draggingKey = key;
		event.dataTransfer.setData('text/plain', key);
		event.dataTransfer.effectAllowed = 'move';
	}

	#onDragOver(event: DragEvent): void {
		if (!this.dragDropScope || !this.#draggingKey) return;
		const targetNode = (event.target as HTMLElement).closest<HTMLElement>('.mb-tree-node');
		if (!targetNode) return;
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';
	}

	#onDrop(event: DragEvent): void {
		if (!this.dragDropScope || !this.#draggingKey) return;
		const targetNode = (event.target as HTMLElement).closest<HTMLElement>('.mb-tree-node');
		const targetKey = targetNode?.getAttribute('data-key');
		if (!targetKey || targetKey === this.#draggingKey) return;

		event.preventDefault();
		const updated = this.#reorderTree(this.value, this.#draggingKey, targetKey);
		if (updated) {
			this.value = updated;
			this.emit('mb-selection-change', { keys: this.selectionKeys });
			this._scheduleRender();
		}
		this.#draggingKey = null;
	}

	#reorderTree(nodes: TreeNode[], fromKey: string, toKey: string): TreeNode[] | null {
		const draft = structuredClone(nodes) as TreeNode[];
		const fromPath = fromKey.split('-').map(item => Number(item));
		const toPath = toKey.split('-').map(item => Number(item));

		const removeAt = (list: TreeNode[], path: number[]): TreeNode | null => {
			if (path.length === 0) return null;
			if (path.length === 1) {
				return list.splice(path[0] ?? -1, 1)[0] ?? null;
			}
			const head = path[0] ?? -1;
			const child = list[head];
			if (!child || !Array.isArray(child.children)) return null;
			return removeAt(child.children, path.slice(1));
		};

		const insertAt = (list: TreeNode[], path: number[], value: TreeNode): boolean => {
			if (path.length === 0) return false;
			if (path.length === 1) {
				list.splice(path[0] ?? list.length, 0, value);
				return true;
			}
			const head = path[0] ?? -1;
			const child = list[head];
			if (!child) return false;
			if (!Array.isArray(child.children)) child.children = [];
			return insertAt(child.children, path.slice(1), value);
		};

		const moved = removeAt(draft, fromPath);
		if (!moved) return null;
		const inserted = insertAt(draft, toPath, moved);
		return inserted ? draft : null;
	}
}

export const defineTree = createDefine('mb-tree', MbTree);

export {};
