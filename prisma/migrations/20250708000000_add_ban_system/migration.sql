-- Adiciona campos de rastreamento ao User
ALTER TABLE "User" ADD COLUMN "lastIpAddress" TEXT;
ALTER TABLE "User" ADD COLUMN "deviceInfo" TEXT;
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "bannedAt" TIMESTAMP;

-- Cria tabela de banimentos
CREATE TABLE "UserBan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "deviceInfo" TEXT NOT NULL,
    "relatedBans" TEXT[],
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBan_pkey" PRIMARY KEY ("id")
);

-- Adiciona relacionamentos
ALTER TABLE "UserBan" ADD CONSTRAINT "UserBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;