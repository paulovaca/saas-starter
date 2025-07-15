import { 
  Package, 
  Plane, 
  Hotel, 
  Car, 
  MapPin, 
  Ticket, 
  Camera, 
  Shield,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Package,
  Plane,
  Hotel,
  Car,
  MapPin,
  Ticket,
  Camera,
  Shield,
};

export function getDynamicIcon(iconName: string): LucideIcon | null {
  return ICON_MAP[iconName] || null;
}
