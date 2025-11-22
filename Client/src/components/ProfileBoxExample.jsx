import React from 'react';
import ProfileBox from './ProfileBox';

const ProfileBoxExample = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>ProfileBox Component Examples</h2>
      
      {/* Basic Usage */}
      <div>
        <h3>Basic Usage</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ProfileBox text="U" />
          <ProfileBox text="V" />
          <ProfileBox text="W" />
          <ProfileBox text="R" />
        </div>
      </div>

      {/* Different Sizes */}
      <div>
        <h3>Different Sizes</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ProfileBox text="S" size={32} className="small" />
          <ProfileBox text="M" size={44} className="medium" />
          <ProfileBox text="L" size={52} />
          <ProfileBox text="XL" size={64} className="large" />
        </div>
      </div>

      {/* With Click Handler */}
      <div>
        <h3>Interactive (Click Me)</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ProfileBox 
            text="C" 
            onClick={() => alert('Profile clicked!')} 
          />
        </div>
      </div>

      {/* Custom Styling */}
      <div>
        <h3>Custom Styling</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ProfileBox 
            text="A" 
            style={{ borderRadius: '50%' }}
          />
          <ProfileBox 
            text="B" 
            style={{ borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Usage in Lists */}
      <div>
        <h3>In Document Lists</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {['Document 1', 'My Report', 'Project Notes', 'Meeting Minutes'].map((title, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <ProfileBox text={title} size={40} />
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{title}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Last edited 2 hours ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileBoxExample;