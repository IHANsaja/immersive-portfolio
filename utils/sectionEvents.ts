// Shared section tracking for the scroll-driven 3D model.
export const SECTION_PINNED_EVENT = 'sectionPinned';

let currentSection: string | null = null;

export const getCurrentSection = () => currentSection;

// Dispatch only when the section actually changes, so ScrollTrigger refreshes
// (resize, breakpoint switch) don't restart the same animation.
export function emitSection(sectionId: string) {
    if (sectionId === currentSection) return;
    currentSection = sectionId;
    window.dispatchEvent(new CustomEvent(SECTION_PINNED_EVENT, { detail: { sectionId } }));
}
