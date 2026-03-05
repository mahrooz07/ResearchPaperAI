import React from 'react';
import { Lightbulb, Wand2 } from 'lucide-react';

export default function IdeaInput({ idea, setIdea, generateTitle, title, setTitle, loadingTitle }) {
    return (
        <div className="panel">
            <div className="panel-title">
                <Lightbulb size={24} color="#818cf8" />
                <span>Research Idea</span>
            </div>
            <div className="input-group">
                <textarea
                    rows="5"
                    placeholder="Explain your core research idea in detail to provide context for the paper..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                />
                <button onClick={generateTitle} disabled={loadingTitle || !idea}>
                    <Wand2 size={18} />
                    {loadingTitle ? 'Generating Protocol...' : 'Generate Title'}
                </button>
            </div>

            {title !== null && (
                <div className="input-group" style={{ marginTop: '0.5rem' }}>
                    <label>Paper Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Your generated or custom title"
                    />
                </div>
            )}
        </div>
    );
}
