import './globals.css';

export const metadata = {
  title: 'DgApp',
  description: 'Data Generation App with Awesome UI/UX',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
