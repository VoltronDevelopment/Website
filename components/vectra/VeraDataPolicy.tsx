import { veraDataPolicy } from "@/lib/vectra/data-policy";
export function VeraDataPolicy({ compact = false }: { compact?: boolean }) {
  const content = <>{Object.values(veraDataPolicy).map(text => <p key={text}>{text}</p>)}</>;
  return compact ? <details className="vera-data-policy"><summary>Data policy · Chats are retained</summary>{content}</details>
    : <section className="vera-data-policy" aria-label="Data policy"><h4>Data policy</h4>{content}</section>;
}
