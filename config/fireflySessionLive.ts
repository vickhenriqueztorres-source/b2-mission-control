import fs from 'fs';
import path from 'path';

export interface FireflySessionLiveResult {
  live: boolean;
  reason: string;
  source: 'env' | 'probe' | 'unauthenticated';
  userProfilePath?: string;
}

/**
 * Função canônica única para verificar se a sessão do Adobe Firefly está verdadeiramente viva.
 * Regra: A mera existência de arquivos (como login_firefly.bat ou pastas de perfil) NÃO qualifica como live.
 */
export async function isFireflySessionLive(): Promise<FireflySessionLiveResult> {
  // 1. Variável de ambiente explícita de sessão ativa
  if (process.env.FIREFLY_SESSION_ACTIVE === '1' || process.env.FIREFLY_DISPATCH === '1') {
    return {
      live: true,
      reason: 'Sessão autenticada ativa confirmada via FIREFLY_SESSION_ACTIVE=1 / FIREFLY_DISPATCH=1.',
      source: 'env'
    };
  }

  // 2. Verificação de profile directory
  const profileDir = process.env.FIREFLY_CHROME_PROFILE_DIR ||
    path.join(process.cwd(), 'firefly-automation', 'data', 'chrome_profile');

  if (!fs.existsSync(profileDir)) {
    return {
      live: false,
      reason: 'Diretório de perfil do Chrome para Firefly não encontrado.',
      source: 'unauthenticated',
      userProfilePath: profileDir
    };
  }

  // A existência de login_firefly.bat ou do diretório NÃO é suficiente para considerar a sessão viva
  return {
    live: false,
    reason: 'Sessão do Adobe Firefly não autenticada no runtime atual. Exige login interativo no navegador.',
    source: 'unauthenticated',
    userProfilePath: profileDir
  };
}
