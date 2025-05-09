export interface Jet {
    id: string;
    name: string;
    type?: string;
    location?: string;
    createdAt: string;
}
export interface JetData {
    jets: Jet[];
}
export interface NewJet {
    name: string;
    type?: string;
    location?: string;
}
