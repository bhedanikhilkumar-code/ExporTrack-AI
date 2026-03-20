/**
 * Indian Ports Data for Shipping Bill Form
 * Major ports used in Indian export declarations
 */
export interface IndianPort {
  code: string;
  name: string;
  state: string;
  type: 'sea' | 'air' | 'land' | 'icd';
}

export const INDIAN_PORTS: IndianPort[] = [
  // Sea Ports
  { code: 'INMAA', name: 'Chennai Port', state: 'Tamil Nadu', type: 'sea' },
  { code: 'INNSA', name: 'Jawaharlal Nehru Port Trust (JNPT)', state: 'Maharashtra', type: 'sea' },
  { code: 'INBOM', name: 'Mumbai Port', state: 'Maharashtra', type: 'sea' },
  { code: 'INKOL', name: 'Kolkata Port', state: 'West Bengal', type: 'sea' },
  { code: 'INHAL', name: 'Haldia Port', state: 'West Bengal', type: 'sea' },
  { code: 'INVIZ', name: 'Visakhapatnam Port', state: 'Andhra Pradesh', type: 'sea' },
  { code: 'INTUT', name: 'Tuticorin Port', state: 'Tamil Nadu', type: 'sea' },
  { code: 'INPAV', name: 'Paradip Port', state: 'Odisha', type: 'sea' },
  { code: 'INCOK', name: 'Cochin Port', state: 'Kerala', type: 'sea' },
  { code: 'INMRM', name: 'Mormugao Port', state: 'Goa', type: 'sea' },
  { code: 'INKDL', name: 'Kandla Port', state: 'Gujarat', type: 'sea' },
  { code: 'INMUN', name: 'Mundra Port', state: 'Gujarat', type: 'sea' },
  { code: 'INPIP', name: 'Pipavav Port', state: 'Gujarat', type: 'sea' },
  { code: 'INMNG', name: 'Mangalore Port', state: 'Karnataka', type: 'sea' },
  { code: 'INENN', name: 'Ennore Port', state: 'Tamil Nadu', type: 'sea' },
  { code: 'INKRI', name: 'Krishnapatnam Port', state: 'Andhra Pradesh', type: 'sea' },
  { code: 'INGOA', name: 'Goa Port', state: 'Goa', type: 'sea' },

  // Air Ports
  { code: 'INDEL', name: 'Indira Gandhi International Airport', state: 'Delhi', type: 'air' },
  { code: 'INBOM', name: 'Chhatrapati Shivaji International Airport', state: 'Maharashtra', type: 'air' },
  { code: 'INMAA', name: 'Chennai International Airport', state: 'Tamil Nadu', type: 'air' },
  { code: 'INCCU', name: 'Netaji Subhas Chandra Bose Airport', state: 'West Bengal', type: 'air' },
  { code: 'INBLR', name: 'Kempegowda International Airport', state: 'Karnataka', type: 'air' },
  { code: 'INHYD', name: 'Rajiv Gandhi International Airport', state: 'Telangana', type: 'air' },
  { code: 'INAMD', name: 'Sardar Vallabhbhai Patel Airport', state: 'Gujarat', type: 'air' },
  { code: 'INCOK', name: 'Cochin International Airport', state: 'Kerala', type: 'air' },
  { code: 'INPNQ', name: 'Pune Airport', state: 'Maharashtra', type: 'air' },
  { code: 'INJPR', name: 'Jaipur International Airport', state: 'Rajasthan', type: 'air' },

  // ICDs (Inland Container Depot)
  { code: 'INTKG', name: 'ICD TKD (Tughlakabad)', state: 'Delhi', type: 'icd' },
  { code: 'INSAB', name: 'ICD Sabarmati', state: 'Gujarat', type: 'icd' },
  { code: 'INLUD', name: 'ICD Ludhiana', state: 'Punjab', type: 'icd' },
  { code: 'INPAT', name: 'ICD Patparganj', state: 'Delhi', type: 'icd' },
  { code: 'INKNU', name: 'ICD Kanpur', state: 'Uttar Pradesh', type: 'icd' },
  { code: 'INAPR', name: 'ICD Ankleshwar', state: 'Gujarat', type: 'icd' },

  // Land Customs Stations
  { code: 'INPGR', name: 'Petrapole', state: 'West Bengal', type: 'land' },
  { code: 'INATG', name: 'Attari', state: 'Punjab', type: 'land' },
  { code: 'INRGN', name: 'Raxaul', state: 'Bihar', type: 'land' },
];

export function getPortsByType(type: 'sea' | 'air' | 'land' | 'icd'): IndianPort[] {
  return INDIAN_PORTS.filter(p => p.type === type);
}
