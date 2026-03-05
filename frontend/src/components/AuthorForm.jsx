import React from 'react';
import { Users } from 'lucide-react';

export default function AuthorForm({ authors, setAuthors }) {
    const handleCountChange = (e) => {
        const count = parseInt(e.target.value) || 0;
        const currentCount = authors.length;

        if (count > currentCount) {
            const newAuthors = Array(count - currentCount).fill({
                name: '', affiliation: '', department: '', email: '', country: ''
            });
            setAuthors([...authors, ...newAuthors]);
        } else if (count < currentCount && count >= 0) {
            setAuthors(authors.slice(0, count));
        }
    };

    const updateAuthor = (index, field, value) => {
        const updated = [...authors];
        updated[index] = { ...updated[index], [field]: value };
        setAuthors(updated);
    };

    return (
        <div className="panel">
            <div className="panel-title">
                <Users size={24} color="#818cf8" />
                <span>Authors</span>
            </div>
            <div className="input-group">
                <label>Number of Authors</label>
                <input
                    type="number"
                    min="0"
                    value={authors.length}
                    onChange={handleCountChange}
                    style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                />
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                {authors.map((author, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(0,0,0,0.1)' }}>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Author {idx + 1}</h4>
                        <div className="input-group" style={{ gap: '0.5rem' }}>
                            <input type="text" placeholder="Full Name" value={author.name} onChange={(e) => updateAuthor(idx, 'name', e.target.value)} />
                            <input type="text" placeholder="Affiliation" value={author.affiliation} onChange={(e) => updateAuthor(idx, 'affiliation', e.target.value)} />
                            <input type="text" placeholder="Department" value={author.department} onChange={(e) => updateAuthor(idx, 'department', e.target.value)} />
                            <input type="text" placeholder="Email" value={author.email} onChange={(e) => updateAuthor(idx, 'email', e.target.value)} />
                            <input type="text" placeholder="Country" value={author.country} onChange={(e) => updateAuthor(idx, 'country', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
