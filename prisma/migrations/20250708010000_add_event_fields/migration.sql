-- Verifica e adiciona campos ao Event se não existirem
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE "Event" ADD COLUMN "time" TEXT;
    EXCEPTION
        WHEN duplicate_column THEN 
        NULL;
    END;

    BEGIN
        ALTER TABLE "Event" ADD COLUMN "brazilTime" TEXT;
    EXCEPTION
        WHEN duplicate_column THEN 
        NULL;
    END;

    BEGIN
        ALTER TABLE "Event" ADD COLUMN "isRescheduled" BOOLEAN NOT NULL DEFAULT false;
    EXCEPTION
        WHEN duplicate_column THEN 
        NULL;
    END;

    BEGIN
        ALTER TABLE "Event" ADD COLUMN "editedBy" TEXT;
    EXCEPTION
        WHEN duplicate_column THEN 
        NULL;
    END;

    BEGIN
        ALTER TABLE "Event" ADD COLUMN "editedAt" TIMESTAMP;
    EXCEPTION
        WHEN duplicate_column THEN 
        NULL;
    END;
END $$;

-- Adiciona relacionamento com editor se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'Event_editedBy_fkey'
    ) THEN
        ALTER TABLE "Event" 
        ADD CONSTRAINT "Event_editedBy_fkey" 
        FOREIGN KEY ("editedBy") 
        REFERENCES "User"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;