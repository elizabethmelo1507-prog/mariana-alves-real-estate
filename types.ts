
export type PropertyStatus = 'Disponível' | 'Reservado' | 'Em negociação' | 'Vendido' | 'Alugado';
export type PropertyType = 'Apartamento' | 'Casa' | 'Terreno' | 'Comercial' | 'Flat' | 'Cobertura';

export type VisitStatus = 'Agendada' | 'Confirmada' | 'Compareceu' | 'Furou' | 'Remarcou' | 'Cancelada';
export type InterestLevel = 'Quente' | 'Morno' | 'Frio';

export type LeadStage = 'Novo' | 'Contato' | 'Visita' | 'Proposta' | 'Negociação' | 'Fechado' | 'Perdido';
export type TaskType = 'MIT' | 'FOLLOW_UP' | 'DOCS' | 'PROPOSAL' | 'VISIT' | 'OTHER' | 'QUALIFY' | 'AUTOMATION_TOUCH';
export type TaskPriority = 'low' | 'med' | 'high';
export type TaskStatus = 'OPEN' | 'DONE' | 'SNOOZED' | 'ARCHIVED';

export type ProposalStatus = 'Rascunho' | 'Enviada' | 'Em negociação' | 'Aceita' | 'Recusada' | 'Expirada' | 'Cancelada';
export type PaymentType = 'À vista' | 'Financiamento' | 'Consórcio' | 'Permuta' | 'Misto';

export type DocStatus = 'PENDING' | 'RECEIVED' | 'VALIDATED';
export type DocCategory = 'Comprador' | 'Vendedor' | 'Imóvel' | 'Contrato' | 'Geral';

export type QualificationLabel = 'HOT' | 'WARM' | 'COLD';
export type DeadlineWindow = '0-7' | '8-30' | '31-90' | '90+';
export type PaymentMethod = 'CASH' | 'FINANCING' | 'CONSORTIUM' | 'EXCHANGE' | 'UNKNOWN';
export type UrgencyLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type BadLeadReason = 'NO_BUDGET' | 'OUTSIDE_AREA' | 'CURIOUS' | 'ALREADY_CLOSED' | 'SPAM' | 'NO_RESPONSE' | 'OTHER';

// Analytics Types
export type LeadSource = 'Instagram (Feed)' | 'Instagram (Stories)' | 'Meta Ads' | 'Google Ads' | 'Indicação' | 'OLX' | 'Portais' | 'Offline' | 'Outro';

export type AnalyticsEventType =
  | 'lead_created'
  | 'contact_made'
  | 'property_view'
  | 'whatsapp_click'
  | 'visit_scheduled'
  | 'visit_completed'
  | 'proposal_created'
  | 'proposal_sent'
  | 'deal_won'
  | 'message_sent'
  | 'automation_triggered';

// Content & Automation Library Types
export type ContentFormat = 'FEED_4x5' | 'SQUARE_1x1' | 'STORY_9x16';
export type ContentStyle = 'MINIMAL' | 'LUX' | 'URGENT';
export type CopyCategory = 'TITLE' | 'SHORT' | 'LONG' | 'CTA' | 'WHATSAPP';
export type CopyTone = 'DIRECT' | 'PREMIUM' | 'URGENT' | 'FAMILY' | 'FRIENDLY';

export type AutomationStage = 'POST_CONTACT' | 'POST_VISIT' | 'POST_PROPOSAL' | 'GHOST' | 'DOCS' | 'RESCHEDULE' | 'FINANCING';

export interface MessageTemplate {
  id: string;
  stage: AutomationStage;
  tone: CopyTone;
  title: string;
  text: string;
  active: boolean;
}

export interface FollowupTouch {
  delayHours: number;
  templateId: string;
  title: string;
}

export interface FollowupSequence {
  id: string;
  name: string;
  stage: LeadStage | 'GHOST';
  touches: FollowupTouch[];
  active: boolean;
}

export interface LeadAutomationState {
  leadId: string;
  activeSequenceId?: string;
  nextTouchAt?: string;
  touchIndex: number;
  paused: boolean;
  lastMessageSentAt?: string;
}

export interface AutomationRule {
  id: string;
  trigger: 'LEAD_CREATED' | 'QUALIFICATION_UPDATED' | 'VISIT_STATUS_CHANGED' | 'PROPOSAL_STATUS_CHANGED' | 'LEAD_GHOSTED';
  conditions: Record<string, any>;
  actions: {
    suggestTemplateId?: string;
    createTaskId?: string;
    applySequenceId?: string;
    activateChecklist?: 'COMPRA' | 'ALUGUEL';
  };
  active: boolean;
}

// Finance Types
export type CommissionStatus = 'PENDING' | 'PARTIAL' | 'RECEIVED';
export type PaymentStatus = 'DUE' | 'OVERDUE' | 'RECEIVED';
export type ExpenseCategory = 'ADS' | 'TRAFFIC' | 'TRANSPORT' | 'FUEL' | 'TOOLS' | 'PHOTOGRAPHY' | 'OTHER';

export interface CommissionPayment {
  id: string;
  commissionId: string;
  amount: number;
  dueDate: string;
  receivedAt?: string;
  status: PaymentStatus;
  method?: 'PIX' | 'TED' | 'CASH' | 'OUTRO';
  notes?: string;
}

export interface Commission {
  id: string;
  leadId?: string;
  leadName?: string;
  propertyId?: string;
  propertyCode?: string;
  proposalId?: string;
  dealValue: number;
  commissionRate: number;
  amountExpected: number;
  amountReceived: number;
  status: CommissionStatus;
  expectedPaymentDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  linkedCampaign?: string;
  receiptUrl?: string;
}

export interface MonthlyGoal {
  id: string;
  month: string; // YYYY-MM
  goalCommission: number;
  goalDeals?: number;
  goalVisits?: number;
}

export interface ContentTemplate {
  id: string;
  name: string;
  format: ContentFormat;
  propertyType?: PropertyType;
  purpose: 'SELL' | 'RENT' | 'LAUNCH';
  styleTag: ContentStyle;
  canvaTemplateUrl?: string;
  active: boolean;
}

export interface CopyTemplate {
  id: string;
  category: CopyCategory;
  tags: string[];
  intent: 'SELL' | 'RENT' | 'LAUNCH';
  propertyType?: PropertyType;
  tone: CopyTone;
  templateText: string;
  active: boolean;
}

export interface BrandingSettings {
  brokerName: string;
  creci: string;
  region: string;
  brandColor: string;
  defaultCta: 'BIO' | 'WHATSAPP';
  hashtags: string[];
}

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  leadId?: string;
  propertyId?: string;
  proposalId?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  occurredAt: string;
  metadata?: Record<string, any>;
}

export interface Lead {
  id: string;
  name: string;
  property: string;
  propertyId?: string;
  propertyCode?: string;
  status: LeadStage;
  timestamp: string;
  email?: string;
  phone?: string;
  lastContactAt: string;
  contactMadeAt?: string;
  interest_type?: 'visit' | 'evaluation' | 'simulation' | 'contact';

  // Marketing / UTM
  source?: LeadSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerUrl?: string;

  // Qualification
  intent?: 'BUY' | 'RENT';
  budgetMin?: number;
  budgetMax?: number;
  neighborhoods?: string[];
  deadline?: DeadlineWindow;
  paymentMethod?: PaymentMethod;
  urgency?: UrgencyLevel;
  motivation?: string;
  mainObjection?: string;
  score?: number;
  qualificationLabel?: QualificationLabel;
  isBadLead?: boolean;
  badLeadReason?: BadLeadReason;
  badLeadNotes?: string;
  lastQualifiedAt?: string;

  // Reactivation
  last_reactivation_at?: string;
  reactivation_touch_count?: number;
  reactivation_status?: 'NONE' | 'ACTIVE' | 'DONE';

  tags?: string[];
  automationState?: LeadAutomationState;

  checklist?: {
    docsRequired: string[];
    docsDone: string[];
    proposalStatus: 'none' | 'drafting' | 'sent' | 'accepted' | 'rejected';
  };

  // Documents
  cpf?: string;
  birthDate?: string;
  rg?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Document {
  id: string;
  leadId: string;
  type: string;
  category: DocCategory;
  title: string;
  fileUrl?: string;
  linkUrl?: string;
  status: DocStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  section: string;
  isDone: boolean;
  doneAt?: string;
}

export interface LeadChecklist {
  leadId: string;
  type: 'COMPRA' | 'ALUGUEL';
  items: ChecklistItem[];
  progress: number;
}

export interface DocTemplate {
  id: string;
  title: string;
  category: 'Compra' | 'Aluguel' | 'Geral';
  content: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  leadName: string;
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  status: ProposalStatus;
  offerValue: number;
  listPriceSnapshot: number;
  discountValue: number;
  discountPercent: number;
  entryValue: number;
  paymentType: PaymentType;
  installments?: number;
  conditions?: string;
  expirationAt?: string;
  notesInternal?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  ownerName?: string;
  ownerPhone?: string;
  leadPhone?: string;
}

export interface NegotiationEvent {
  id: string;
  proposalId: string;
  actor: 'Corretor' | 'Cliente' | 'Proprietário' | 'Banco';
  channel: 'WhatsApp' | 'Ligação' | 'Presencial' | 'Email';
  eventType: 'Ajuste de valor' | 'Contra-proposta' | 'Aceite' | 'Recusa' | 'Observação' | 'Mensagem';
  summary: string;
  details?: string;
  amountChange?: number;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  leadId?: string;
  leadName?: string;
  propertyId?: string;
  propertyCode?: string;
  type: TaskType;
  title: string;
  description?: string;
  dueAt: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  qualificationLabel?: QualificationLabel;
  score?: number;
  automationMessage?: string;
}

export interface Visit {
  id: string;
  leadId: string;
  leadName: string;
  propertyId: string;
  propertyTitle: string;
  propertyCode: string;
  address: string;
  startAt: string;
  durationMinutes: number;
  status: VisitStatus;
  notes?: string;
  meetingPoint?: string;
  checkinAt?: string;
  checkinNotes?: string;
  interestLevel?: InterestLevel;
  nextAction?: string;
  reminderSettings: {
    whatsapp: boolean;
    email: boolean;
  };
}

export interface Property {
  id: string;
  code: string;
  title: string;
  price: number;
  isPriceUnderConsultation?: boolean;
  location: string;
  neighborhood: string;
  image: string;
  gallery: string[];
  area: number;
  rooms: number;
  bathrooms: number;
  suites: number;
  parking: number;
  description: string;
  features: string[];
  status: PropertyStatus;
  type: PropertyType;
  purpose: 'Venda' | 'Aluguel';
  pageViews: number;
  whatsappClicks: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  condoFee?: number;
  iptu?: number;
  commission?: string;
  videoUrl?: string;
  tourUrl?: string;
  ownerName?: string;
  ownerPhone?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
}


// ... existing types ...

// SaaS / Self-Service Types

export type PlanType = 'FREE' | 'PRO' | 'PREMIUM';
export type PlanStatus = 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
export type PaymentProvider = 'STRIPE' | 'ASAAS' | 'HOTMART';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  creci: string;
  domain?: string; // custom domain or subdomain
  subdomain?: string; // e.g. "mariana" in mariana.brokerlink.com
  logoUrl?: string;
  coverPhotoUrl?: string;
  description?: string;
  regionsServed?: string[];
  brandColors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  plan: PlanType;
  planStatus: PlanStatus;
  planRenewalDate?: string;
  commissionRateDefault?: number;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfig {
  userId: string;
  templateId: 'MINIMAL' | 'LUXURY' | 'LEAD_FOCUS';
  sectionsOrder: string[]; // ['hero', 'featured', 'services', 'testimonials', 'faq']
  sectionsEnabled: Record<string, boolean>;
  customDomain?: string;
  dnsConfig?: {
    cname: string;
    verified: boolean;
  };
  contactFormFields: {
    key: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'select' | 'number';
    required: boolean;
    enabled: boolean;
    options?: string[]; // for select
  }[];
}

export interface Integration {
  id: string;
  userId: string;
  type: 'GOOGLE_CALENDAR' | 'ZAPIER' | 'ASAAS' | 'OLX' | 'FACEBOOK_ADS';
  name: string;
  config: Record<string, any>; // API keys, webhooks, etc.
  active: boolean;
  connectedAt?: string;
}

export interface ChecklistTemplate {
  id: string;
  userId: string;
  name: string; // e.g. "Padrão Compra", "Padrão Aluguel"
  type: 'COMPRA' | 'ALUGUEL';
  items: {
    label: string;
    section: string;
    required: boolean;
  }[];
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: PlanStatus;
  provider: PaymentProvider;
  providerSubscriptionId?: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

