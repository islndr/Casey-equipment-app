export interface Spec {
  id?: string; // Add id property to match the usage in the component
  column1: string;
  column2: string;
  column3: string;
  [key: string]: string | undefined;
}