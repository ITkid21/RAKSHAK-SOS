/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { User, X, Save, Stethoscope } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(localStorage.getItem('sos_guardian_name') || '');
            setPhone(localStorage.getItem('sos_guardian_phone') || '');
            setBloodGroup(localStorage.getItem('sos_med_blood') || '');
            setHeight(localStorage.getItem('sos_med_height') || '');
            setWeight(localStorage.getItem('sos_med_weight') || '');
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('sos_guardian_name', name);
        localStorage.setItem('sos_guardian_phone', phone);
        localStorage.setItem('sos_med_blood', bloodGroup);
        localStorage.setItem('sos_med_height', height);
        localStorage.setItem('sos_med_weight', weight);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px',
                width: '100%', maxWidth: '350px', border: '1px solid #475569',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={20} /> Profile & Medical
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Emergency Contact Section */}
                    <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Guardian Contact
                    </h3>
                    <div>
                        <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'block' }}>Name</label>
                        <input type="text" placeholder="e.g. Papa" value={name} onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
                    </div>
                    <div>
                        <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'block' }}>Phone</label>
                        <input type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
                    </div>

                    <div style={{ height: '1px', background: '#334155', margin: '4px 0' }}></div>

                    {/* Medical Details Section */}
                    <h3 style={{ margin: 0, color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Stethoscope size={16} /> Medical Details
                    </h3>
                    <div>
                        <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'block' }}>Blood Group</label>
                        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }}>
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option> <option value="A-">A-</option>
                            <option value="B+">B+</option> <option value="B-">B-</option>
                            <option value="AB+">AB+</option> <option value="AB-">AB-</option>
                            <option value="O+">O+</option> <option value="O-">O-</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'block' }}>Height (cm)</label>
                            <input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'block' }}>Weight (kg)</label>
                            <input type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white' }} />
                        </div>
                    </div>

                    <button onClick={handleSave}
                        style={{
                            background: '#2563eb', color: 'white', border: 'none', padding: '12px',
                            borderRadius: '8px', fontWeight: 'bold', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '8px',
                            marginTop: '10px'
                        }}>
                        <Save size={18} /> Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
