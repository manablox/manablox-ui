export const INPUTGROUP_STYLES = `
:host{
	display:inline-flex;
	width:auto;
}
.mb-inputgroup{
	display:flex;
	align-items:center;
	gap: 0.5rem;
}
::slotted(.mb-inputgroup-addon){
	display:inline-flex;
	align-items:center;
	padding: 0.5rem 0.75rem;
	background: var(--mb-inputgroup-addon-bg, #f3f3f3);
	border: var(--mb-inputgroup-addon-border, 1px solid #ddd);
	color: var(--mb-inputgroup-addon-color, inherit);
	border-radius: var(--mb-inputgroup-addon-radius, 4px);
}
::slotted(*){
	flex:1 1 auto;
}
::slotted(.mb-inputgroup-addon){
	flex: 0 0 auto;
}
`;
