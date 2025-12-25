import { Program } from "@/types";
import { atom } from "jotai";

export const isNavPanelOpenAtom = atom(true);

export const nowProgramIdAtom = atom('');
export const programsAtom = atom<Program[]>([]);
export const isProgramLoadingAtom = atom(false);


