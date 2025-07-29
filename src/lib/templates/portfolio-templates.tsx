import type { TemplateProps } from '@/types'

// Multi-Website Portfolio Template
export function MultiWebsiteTemplate(props: TemplateProps) {
    return (
        <div className="portfolio-multi">
            {/* Header Section */}
            <header className="header">
                <div className="header-content">
                    <h1 className="title">{props.title}</h1>
                    <p className="subtitle">Portfolio Collection</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="content">
                {/* Website Screenshot */}
                <div className="screenshot-section">
                    <img
                        src={`data:image/png;base64,${props.screenshot}`}
                        alt={props.title}
                        className="website-screenshot"
                    />
                </div>

                {/* Website Information */}
                <div className="info-section">
                    <h2 className="website-title">{props.title}</h2>
                    <p className="website-url">{props.url}</p>

                    {/* Features List */}
                    <div className="features">
                        <h3 className="features-title">Key Features</h3>
                        <ul className="features-list">
                            {props.features.slice(0, 4).map((feature, index) => (
                                <li key={index} className="feature-item">• {feature}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>

            {/* Footer Section */}
            <footer className="footer">
                <div className="footer-content">
                    <h3 className="footer-title">Professional Web Portfolio</h3>
                    <p className="footer-description">
                        {props.description ?? 'Showcase of professional web development projects'}
                    </p>
                </div>
            </footer>

            {/* Style Badges */}
            <div className="badges">
                <span className="badge portfolio-badge">Portfolio</span>
                <span className="badge aspect-badge">16:9</span>
            </div>
        </div>
    )
}

// Single Website Portfolio Template
export function SingleWebsiteTemplate(props: TemplateProps) {
    return (
        <div className="portfolio-single">
            {/* Header */}
            <header className="header">
                <h1 className="title">{props.title}</h1>
            </header>

            {/* Main Content */}
            <main className="content">
                {/* Large Screenshot */}
                <div className="screenshot-section">
                    <img
                        src={`data:image/png;base64,${props.screenshot}`}
                        alt={props.title}
                        className="main-screenshot"
                    />
                </div>

                {/* Detailed Information */}
                <div className="details-section">
                    <p className="website-url">{props.url}</p>
                    <h2 className="category">{props.category}</h2>
                    <p className="purpose">{props.purpose}</p>

                    {/* Features */}
                    <div className="features">
                        <h3 className="features-title">Key Features:</h3>
                        <ul className="features-list">
                            {props.features.slice(0, 5).map((feature, index) => (
                                <li key={index} className="feature-item">• {feature}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>

            {/* Bottom Information */}
            <footer className="footer">
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Target Audience:</span>
                        <span className="info-value">{props.targetAudience}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Technology:</span>
                        <span className="info-value">{props.technology.join(', ')}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Design:</span>
                        <span className="info-value">{props.designStyle}</span>
                    </div>
                </div>
            </footer>

            {/* Style Badges */}
            <div className="badges">
                <span className="badge single-badge">Single Site</span>
                <span className="badge aspect-badge">16:9</span>
            </div>
        </div>
    )
}

// Creative Portfolio Template
export function CreativePortfolioTemplate(props: TemplateProps) {
    return (
        <div className="portfolio-creative">
            {/* Creative Header */}
            <header className="creative-header">
                <div className="creative-title">
                    <h1>{props.title}</h1>
                    <div className="creative-accent"></div>
                </div>
            </header>

            {/* Creative Layout */}
            <main className="creative-content">
                <div className="creative-screenshot">
                    <img
                        src={`data:image/png;base64,${props.screenshot}`}
                        alt={props.title}
                        className="screenshot"
                    />
                    <div className="creative-overlay"></div>
                </div>

                <div className="creative-info">
                    <h2 className="creative-subtitle">{props.category}</h2>
                    <p className="creative-description">{props.description}</p>

                    <div className="creative-features">
                        {props.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="creative-feature">
                                <span className="feature-icon">✦</span>
                                <span className="feature-text">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Creative Footer */}
            <footer className="creative-footer">
                <div className="creative-badges">
                    <span className="creative-badge">{props.targetAudience}</span>
                    <span className="creative-badge">{props.technology[0]}</span>
                </div>
            </footer>
        </div>
    )
}

// Professional Template
export function ProfessionalTemplate(props: TemplateProps) {
    return (
        <div className="portfolio-professional">
            {/* Professional Header */}
            <header className="professional-header">
                <h1 className="professional-title">{props.title}</h1>
                <p className="professional-subtitle">Professional Web Development</p>
            </header>

            {/* Professional Content */}
            <main className="professional-content">
                <div className="professional-screenshot">
                    <img
                        src={`data:image/png;base64,${props.screenshot}`}
                        alt={props.title}
                        className="screenshot"
                    />
                </div>

                <div className="professional-details">
                    <div className="detail-item">
                        <label>URL:</label>
                        <span>{props.url}</span>
                    </div>
                    <div className="detail-item">
                        <label>Category:</label>
                        <span>{props.category}</span>
                    </div>
                    <div className="detail-item">
                        <label>Purpose:</label>
                        <span>{props.purpose}</span>
                    </div>

                    <div className="professional-features">
                        <h3>Key Features</h3>
                        <ul>
                            {props.features.slice(0, 4).map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>

            {/* Professional Footer */}
            <footer className="professional-footer">
                <div className="professional-info">
                    <div className="info-row">
                        <span>Target: {props.targetAudience}</span>
                        <span>Tech: {props.technology.join(', ')}</span>
                    </div>
                    <div className="info-row">
                        <span>Style: {props.designStyle}</span>
                    </div>
                </div>
            </footer>
        </div>
    )
} 