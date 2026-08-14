import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Brain, CheckCircle2, XCircle, AlertTriangle,
  FileText, Database, Eye, BarChart2, BookOpen, User, Clock,
  ChevronDown, MessageSquare, Shield, AlertCircle
} from 'lucide-react';
import { getFinding, acceptFinding, overrideFinding, searchRegulations } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    MISMATCH: 'Mismatch Detected',
    MINOR_MISMATCH: 'Minor Mismatch',
    CONSISTENT: 'Consistent',
    INSUFFICIENT_EVIDENCE: 'Insufficient Evidence',
    REQUIRES_VERIFICATION: 'Requires Verification',
    POTENTIAL_MISMATCH: 'Potential Discrepancy',
    MISSING_EVIDENCE: 'Missing Evidence',
  };
  return map[s] || s.replace(/_/g, ' ');
};

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    MISMATCH: 'badge-high',
    MINOR_MISMATCH: 'badge-medium',
    CONSISTENT: 'badge-low',
    INSUFFICIENT_EVIDENCE: 'badge-medium',
    REQUIRES_VERIFICATION: 'badge-blue',
    POTENTIAL_MISMATCH: 'badge-high',
    MISSING_EVIDENCE: 'badge-medium',
  };
  return map[status] || 'badge-gray';
};

// Evidence trace node component
const EvidenceNode: React.FC<{
  icon: React.FC<any>;
  label: string;
  sublabel: string;
  value?: string;
  type: 'source' | 'process' | 'output' | 'decision';
}> = ({ icon: Icon, label, sublabel, value, type }) => {
  const colors = {
    source: 'border-blue-300 bg-blue-50',
    process: 'border-amber-300 bg-amber-50',
    output: 'border-red-300 bg-red-50',
    decision: 'border-green-300 bg-green-50',
  };

  return (
    <div className={`evidence-node ${colors[type]}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          type === 'source' ? 'bg-blue-100' : type === 'process' ? 'bg-amber-100' : type === 'output' ? 'bg-red-100' : 'bg-green-100'
        }`}>
          <Icon size={17} className={
            type === 'source' ? 'text-blue-600' : type === 'process' ? 'text-amber-600' : type === 'output' ? 'text-red-600' : 'text-green-600'
          } />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</div>
          <div className="font-semibold text-slate-800 text-sm">{sublabel}</div>
          {value && <div className="text-sm text-slate-600 mt-0.5">{value}</div>}
        </div>
      </div>
    </div>
  );
};

const Connector: React.FC = () => (
  <div className="flex flex-col items-center my-1">
    <div className="evidence-connector h-8 w-0.5" />
    <ChevronDown size={16} className="text-slate-300 -mt-1" />
  </div>
);

// Helper to get claim/evidence values based on finding category and data
const getClaimValue = (finding: any) => {
  const cat = finding.category;
  if (cat === 'Student Data') return 'Total Students: 3,000';
  if (cat === 'Faculty Data') return 'Total Faculty: 150';
  if (cat === 'Infrastructure') return 'Laboratories: 10';
  if (cat === 'Fire Safety') return 'Fire Extinguishers: 24';
  if (cat === 'Documents') return 'Affiliation Certificate: Required';
  return 'Self-Reported Data (SSR)';
};

const getExternalValues = (finding: any) => {
  const cat = finding.category;
  if (cat === 'Student Data') return { aishe: 'Students: 2,750', nirf: 'Students: 2,780' };
  if (cat === 'Faculty Data') return { aishe: 'Faculty: 148', nirf: 'Faculty: 147' };
  if (cat === 'Infrastructure') return { aishe: 'Laboratories: 9', nirf: null };
  return null;
};

const getVisualEvidence = (finding: any) => {
  const cat = finding.category;
  if (cat === 'Infrastructure') return 'AI detected 8 identifiable laboratory spaces across 2 images';
  if (cat === 'Fire Safety') return 'AI (YOLO) detected 3 fire extinguishers + 1 emergency exit sign';
  return null;
};

const FindingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regulations, setRegulations] = useState<any[]>([]);
  const [showAccept, setShowAccept] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isInstitution = hasRole(['INSTITUTION_ADMIN', 'INSTITUTION_STAFF']);

  useEffect(() => {
    if (!id) return;
    getFinding(id).then(f => {
      setFinding(f);
      setLoading(false);
      // Retrieve relevant regulations via RAG
      searchRegulations(f.category + ' ' + f.title).then(regs => setRegulations(regs.slice(0, 2)));
    });
  }, [id]);

  const handleAccept = async () => {
    if (!id || !user) return;
    setSubmitting(true);
    try {
      const updated = await acceptFinding(id, user.id, comment);
      setFinding(updated);
      setShowAccept(false);
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverride = async () => {
    if (!id || !user || !reason) return;
    setSubmitting(true);
    try {
      const updated = await overrideFinding(id, user.id, reason, comment);
      setFinding(updated);
      setShowOverride(false);
      setComment('');
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className={`w-8 h-8 border-2 ${isInstitution ? 'border-emerald-200 border-t-emerald-600' : 'border-blue-200 border-t-blue-600'} rounded-full animate-spin-slow`} style={{ borderWidth: 2 }} />
    </div>
  );

  if (!finding) return <div className="p-8 text-slate-500">Finding not found.</div>;

  const evidence = JSON.parse(finding.evidence || '[]');
  const externalVals = getExternalValues(finding);
  const visualEvidence = getVisualEvidence(finding);
  const isKeyFinding = finding.finding_number === 'F-004'; // The most important demo screen

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Finding F-004 special demo banner */}
      {isKeyFinding && !isInstitution && (
        <div className="alert alert-warning mb-5">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Key Demo Finding — Laboratory Evidence Discrepancy</span>
            <div className="text-xs mt-0.5 opacity-80">
              This is the primary evidence cross-verification demonstration. Institution: 10 labs · Visual AI: 8 identifiable · External (AISHE): 9 labs.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{finding.finding_number}</span>
              <span className="badge badge-gray text-xs">{finding.category}</span>
              <div className="ai-label"><Brain size={11} />AI Finding</div>
              {isKeyFinding && !isInstitution && (
                <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                  ★ Key Demo
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">{finding.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`badge border ${statusColor(finding.status)} text-sm`}>
                {statusLabel(finding.status)}
              </span>
              <span className={`badge ${finding.risk === 'High' ? 'badge-high' : finding.risk === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                {finding.risk} Risk
              </span>
              {!isInstitution && (
                <span className="text-xs text-slate-400">
                  AI Confidence: <strong>{Math.round(finding.ai_confidence * 100)}%</strong>
                </span>
              )}
            </div>
          </div>

          {finding.inspector_decision && (
            <div className={`p-4 rounded-xl border ${finding.inspector_decision === 'ACCEPTED' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                {finding.inspector_decision === 'ACCEPTED' ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <XCircle size={16} className="text-amber-600" />
                )}
                <span className={`font-bold text-sm ${finding.inspector_decision === 'ACCEPTED' ? 'text-green-700' : 'text-amber-700'}`}>
                  {finding.inspector_decision}
                </span>
              </div>
              <div className="text-xs text-slate-500">{isInstitution ? 'Final Decision' : 'Inspector Decision'}</div>
              {finding.decided_at && (
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(finding.decided_at).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-700 leading-relaxed">{finding.description}</p>
        </div>

        {/* AI Explanation / Recommendation */}
        {!isInstitution && (
          <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Brain size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">AI Recommendation</span>
            </div>
            <p className="text-sm text-blue-800">
              {finding.status === 'MISMATCH' || finding.status === 'POTENTIAL_MISMATCH'
                ? 'REVIEW — Potential discrepancy detected. Manual verification required. Do not make a final determination until physical evidence is verified on-site.'
                : finding.status === 'INSUFFICIENT_EVIDENCE'
                ? 'VERIFY — Uploaded visual evidence is insufficient to confirm or deny the claim. Physical site inspection is recommended.'
                : finding.status === 'MISSING_EVIDENCE'
                ? 'ACTION REQUIRED — Mandatory document is missing. Request the institution to submit the required document before finalizing the inspection.'
                : finding.status === 'CONSISTENT'
                ? 'CONSISTENT — Evidence across all sources is aligned. No discrepancy detected.'
                : 'MANUAL REVIEW — Inspector verification recommended.'
              }
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence Traceability */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="section-title">Evidence Trace</h2>
            <div className="ai-label"><Brain size={11} />Traced</div>
          </div>

          <div className="space-y-1">
            {/* Institution claim */}
            <EvidenceNode
              icon={Shield}
              label="Institution Claim (SSR)"
              sublabel="Self-Reported Data"
              value={getClaimValue(finding)}
              type="source"
            />
            <Connector />

            {/* Documentary evidence */}
            {evidence.filter((e: string) => e.includes('.pdf')).slice(0, 1).map((e: string, i: number) => (
              <React.Fragment key={i}>
                <EvidenceNode
                  icon={FileText}
                  label="Documentary Evidence"
                  sublabel={e.split(' (')[0]}
                  value={e.includes('(') ? e.split('(')[1].replace(')', '') : 'Analyzed by OCR'}
                  type="source"
                />
                <Connector />
              </React.Fragment>
            ))}

            {/* Visual evidence (if available) */}
            {visualEvidence && (
              <>
                <EvidenceNode
                  icon={Eye}
                  label="Visual Evidence (AI — YOLO)"
                  sublabel={evidence.find((e: string) => e.includes('.jpg'))?.split(' (')[0] || 'Uploaded Image'}
                  value={visualEvidence}
                  type="source"
                />
                <Connector />
              </>
            )}

            {/* External data (if available) */}
            {externalVals && (
              <>
                <EvidenceNode
                  icon={Database}
                  label="External Data — AISHE Dataset"
                  sublabel="AISHE 2025 Returns (Local Reference)"
                  value={externalVals.aishe}
                  type="source"
                />
                <Connector />
                {externalVals.nirf && (
                  <>
                    <EvidenceNode
                      icon={Database}
                      label="External Data — NIRF Dataset"
                      sublabel="NIRF 2024 Ranking Data (Local Reference)"
                      value={externalVals.nirf}
                      type="source"
                    />
                    <Connector />
                  </>
                )}
              </>
            )}

            {/* AI Cross-Verification */}
            <EvidenceNode
              icon={Brain}
              label="AI Cross-Verification Engine"
              sublabel={statusLabel(finding.status)}
              value={
                finding.status === 'MISMATCH' ? 'Discrepancy detected across multiple sources' :
                finding.status === 'POTENTIAL_MISMATCH' ? 'Potential discrepancy — manual verification required' :
                finding.status === 'INSUFFICIENT_EVIDENCE' ? 'Visual coverage insufficient to verify claim' :
                finding.status === 'MISSING_EVIDENCE' ? 'Mandatory document not uploaded' :
                finding.status === 'CONSISTENT' ? 'Evidence consistent across all sources' :
                'Physical verification recommended'
              }
              type="process"
            />
            <Connector />

            {/* Risk Engine */}
            {!isInstitution && (
              <>
                <EvidenceNode
                  icon={BarChart2}
                  label="Risk Engine"
                  sublabel={`${finding.risk} Risk — Contributes to inspection risk score`}
                  value={`AI Confidence: ${Math.round(finding.ai_confidence * 100)}%`}
                  type="output"
                />
                <Connector />
              </>
            )}

            {/* Regulation */}
            {regulations.length > 0 && (
              <>
                <EvidenceNode
                  icon={BookOpen}
                  label="Applicable Regulation (RAG)"
                  sublabel={regulations[0].source + ' — ' + regulations[0].document}
                  value={regulations[0].section}
                  type="process"
                />
              </>
            )}

            {/* Inspector Decision */}
            <Connector />
            {finding.inspector_decision ? (
              <EvidenceNode
                icon={User}
                label="Inspector Decision"
                sublabel={`${finding.inspector_decision} — ${user?.name || 'Inspector'}`}
                value={finding.inspector_comment || ''}
                type="decision"
              />
            ) : (
              <div className="evidence-node border-dashed border-slate-300 bg-slate-50">
                <div className="text-center py-2">
                  <Shield size={20} className="text-slate-300 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {isInstitution ? 'PENDING DECISION' : 'AWAITING INSPECTOR DECISION'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {isInstitution ? 'Under review by inspection team' : 'Accept or override this AI finding below'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decision panel + Regulations */}
        <div className="space-y-5">
          {/* Inspector Decision Panel - Only for Inspectors */}
          {!isInstitution && (
            !finding.inspector_decision ? (
              <div className="card p-6">
                <h2 className="section-title mb-2">Inspector Decision</h2>
                <p className="text-sm text-slate-500 mb-5">
                  Review the AI finding and make your decision. Your decision will be recorded in the inspection report with timestamp and audit trail.
                </p>

                <div className="alert alert-info mb-5">
                  <Brain size={15} className="flex-shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <strong>AI Suggests:</strong> {statusLabel(finding.status)}.{' '}
                    Final determination is yours as the authorized inspector.
                  </span>
                </div>

                {!showAccept && !showOverride && (
                  <div className="flex gap-3">
                    <button id="accept-finding-btn" onClick={() => { setShowAccept(true); setShowOverride(false); }} className="btn btn-success flex-1 justify-center">
                      <CheckCircle2 size={16} /> Accept Finding
                    </button>
                    <button id="override-finding-btn" onClick={() => { setShowOverride(true); setShowAccept(false); }} className="btn btn-danger flex-1 justify-center">
                      <XCircle size={16} /> Override
                    </button>
                  </div>
                )}

                {showAccept && (
                  <div className="animate-fade-in">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                      <div className="font-semibold text-green-800 text-sm mb-1">Accepting this finding</div>
                      <div className="text-xs text-green-700">The AI finding will be accepted and recorded in the inspection report.</div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Comment (optional)</label>
                      <textarea
                        rows={3}
                        className="form-input resize-none"
                        placeholder="Add any inspector notes..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowAccept(false)} className="btn btn-secondary">Cancel</button>
                      <button id="confirm-accept-btn" onClick={handleAccept} disabled={submitting} className="btn btn-success flex-1 justify-center">
                        <CheckCircle2 size={15} /> {submitting ? 'Submitting...' : 'Confirm Accept'}
                      </button>
                    </div>
                  </div>
                )}

                {showOverride && (
                  <div className="animate-fade-in">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <div className="font-semibold text-amber-800 text-sm mb-1">Overriding AI finding</div>
                      <div className="text-xs text-amber-700">You are overriding the AI finding. A reason is required and will be recorded in the audit trail.</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Override Reason <span className="text-red-500">*</span></label>
                      <select
                        className="form-input mb-2"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                      >
                        <option value="">Select a reason...</option>
                        <option value="Visual evidence was incomplete — not all areas photographed">Visual evidence was incomplete — not all areas photographed</option>
                        <option value="External dataset is from an older reporting cycle">External dataset is from an older reporting cycle</option>
                        <option value="Inspector verified the facility physically during site visit">Inspector verified the facility physically during site visit</option>
                        <option value="Institution submitted updated data after AISHE reporting cycle">Institution submitted updated data after AISHE reporting cycle</option>
                        <option value="Data discrepancy explained by administrative reclassification">Data discrepancy explained by administrative reclassification</option>
                        <option value="Discrepancy within acceptable variance — no compliance concern">Discrepancy within acceptable variance — no compliance concern</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Additional Comment</label>
                      <textarea
                        rows={3}
                        className="form-input resize-none"
                        placeholder="Provide additional context for the override..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowOverride(false)} className="btn btn-secondary">Cancel</button>
                      <button id="confirm-override-btn" onClick={handleOverride} disabled={submitting || !reason} className="btn btn-danger flex-1 justify-center">
                        <XCircle size={15} /> {submitting ? 'Submitting...' : 'Confirm Override'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`card p-6 ${finding.inspector_decision === 'ACCEPTED' ? 'border-green-300' : 'border-amber-300'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {finding.inspector_decision === 'ACCEPTED' ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : (
                    <XCircle size={20} className="text-amber-600" />
                  )}
                  <h2 className="section-title">Decision Recorded</h2>
                </div>
                <div className={`badge mb-3 ${finding.inspector_decision === 'ACCEPTED' ? 'badge-low' : 'badge-medium'}`}>
                  {finding.inspector_decision}
                </div>
                {finding.inspector_comment && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-slate-400 mt-0.5" />
                      <p className="text-sm text-slate-700">{finding.inspector_comment}</p>
                    </div>
                  </div>
                )}
                {finding.decided_at && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                    <Clock size={12} />
                    {new Date(finding.decided_at).toLocaleString()}
                  </div>
                )}
              </div>
            )
          )}

          {/* Decision panel for Institution if decided */}
          {isInstitution && finding.inspector_decision && (
            <div className={`card p-6 ${finding.inspector_decision === 'ACCEPTED' ? 'border-green-300' : 'border-amber-300'}`}>
              <div className="flex items-center gap-2 mb-3">
                {finding.inspector_decision === 'ACCEPTED' ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <XCircle size={20} className="text-amber-600" />
                )}
                <h2 className="section-title">Final Resolution</h2>
              </div>
              <div className={`badge mb-3 ${finding.inspector_decision === 'ACCEPTED' ? 'badge-low' : 'badge-medium'}`}>
                {finding.inspector_decision}
              </div>
              {finding.inspector_comment && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="text-slate-400 mt-0.5" />
                    <p className="text-sm text-slate-700">{finding.inspector_comment}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Relevant Regulations */}
          {regulations.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-blue-600" />
                <h2 className="section-title">Applicable Regulations</h2>
                <div className="ml-auto text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded font-medium">RAG Retrieved</div>
              </div>
              <div className="space-y-3">
                {regulations.map(reg => (
                  <div key={reg.id} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-blue text-xs">{reg.source}</span>
                      <span className="text-xs text-slate-500 truncate">{reg.section}</span>
                    </div>
                    <div className="font-semibold text-slate-800 text-sm mb-2">{reg.title}</div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{reg.excerpt}</p>
                    <div className="mt-2 text-xs text-slate-400 italic">{reg.document}</div>
                    {!isInstitution && (
                      <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                        <p className="text-xs text-yellow-700">
                          ⚠️ Demo Regulatory Reference — verify against the applicable current official manual before citing in formal reports.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence sources list */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Evidence Sources</h2>
            <div className="space-y-2">
              {evidence.map((e: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  {e.includes('.pdf') ? <FileText size={13} className="text-red-500 flex-shrink-0" /> :
                   e.includes('.jpg') ? <Eye size={13} className="text-purple-500 flex-shrink-0" /> :
                   <Database size={13} className="text-cyan-500 flex-shrink-0" />}
                  <span className="text-xs text-slate-700">{e}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI disclaimer */}
          <div className="disclaimer">
            <strong>UNI-INSPECTION</strong> — AI findings are indicative only.
            Final inspection decisions rest with the authorized human inspector.
            This finding does not constitute accreditation approval or rejection.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindingDetailPage;
