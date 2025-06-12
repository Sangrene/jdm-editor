import React from 'react';

export type JdmConfigProviderProps = {
  prefixCls?: string;
  children?: React.ReactNode;
};

export const JdmConfigProvider: React.FC<JdmConfigProviderProps> = ({ children }) => {
  return (
    <>
      <GlobalCssVariables />
      {children}
    </>
  );
};

const GlobalCssVariables = () => {
  const cssVariables = {
    '--grl-color-border': '#d9d9d9',
    '--grl-color-border-hover': '#c3c3c3',
    '--grl-color-border-fade': '#eef0f5',
    '--grl-color-primary': '#1677ff',
    '--grl-color-primary-bg': '#e6f4ff',
    '--grl-color-primary-bg-fade': '#f8fafc',
    '--grl-color-primary-bg-hover': '#bae0ff',
    '--grl-color-primary-border': '#91caff',
    '--grl-color-primary-border-hover': '#69b1ff',
    '--grl-color-primary-text-hover': '#4096ff',
    '--grl-color-success': '#52c41a',
    '--grl-color-success-bg': '#f6ffed',
    '--grl-color-success-border': '#b7eb8f',
    '--grl-color-error': '#ff4d4f',
    '--grl-color-error-bg': '#fff2f0',
    '--grl-color-error-border': '#ffccc7',
    '--grl-color-warning': '#faad14',
    '--grl-color-warning-bg': '#fffbe6',
    '--grl-color-warning-border': '#ffe58f',
    '--grl-color-warning-text': '#faad14',
    '--grl-color-info': '#1677ff',
    '--grl-color-info-bg': '#e6f4ff',
    '--grl-color-info-border': '#91caff',
    '--grl-color-info-text': '#1677ff',
    '--grl-color-bg-layout': '#f5f5f5',
    '--grl-color-bg-mask': 'rgba(0,0,0,0.45)',
    '--grl-color-bg-elevated': '#ffffff',
    '--grl-color-bg-container': '#ffffff',
    '--grl-color-bg-container-disabled': 'rgba(0,0,0,0.04)',
    '--grl-color-bg-text-hover': 'rgba(0,0,0,0.06)',
    '--grl-color-primary-hover': '#4096ff',
    '--grl-color-primary-active': '#0958d9',
    '--grl-color-text': 'rgba(0,0,0,0.88)',
    '--grl-color-text-placeholder': 'rgba(0,0,0,0.25)',
    '--grl-color-text-base': '#000',
    '--grl-color-text-disabled': 'rgba(0,0,0,0.25)',
    '--grl-color-text-secondary': 'rgba(0,0,0,0.65)',
    '--grl-control-outline': 'rgba(5,145,255,0.1)',
    '--grl-primary-color': '#1677ff',
    '--grl-primary-color-bg': '#e6f4ff',
    '--grl-font-family':
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',\n'Noto Color Emoji'",
    '--grl-line-height': 1.5714285714285714,
    '--grl-border-radius': '6px',
    '--grl-decision-table-output': '#eaeaea',
    '--grl-decision-table-selected-row': '#f4faff',

    '--node-color-blue': 'var(--grl-color-primary)',
    '--node-color-purple': '#7c4dff',
    '--node-color-orange': '#f76d40',
    '--node-color-green': '#10ac84',
  };

  const cssBlock = Object.entries(cssVariables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  return <style dangerouslySetInnerHTML={{ __html: `:root {\n${cssBlock}\n}` }} />;
};
