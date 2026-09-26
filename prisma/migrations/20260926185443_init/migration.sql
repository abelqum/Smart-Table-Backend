-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'HOSTESS', 'WAITER', 'CLEANING');

-- CreateEnum
CREATE TYPE "EstadoMesa" AS ENUM ('AVAILABLE', 'OCCUPIED', 'DIRTY', 'CLEANING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "FormaMesa" AS ENUM ('RECTANGLE', 'ROUND');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('WAITING', 'SEATED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('WAITLIST_CREATED', 'WAITLIST_CANCELLED', 'TABLE_ASSIGNED', 'TABLE_ASSIGNED_CAPACITY_OVERRIDE', 'CUSTOMERS_LEFT', 'CLEANING_STARTED', 'CLEANING_FINISHED', 'NFC_SCANNED');

-- CreateEnum
CREATE TYPE "OrigenEvento" AS ENUM ('WEB', 'ANDROID', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TipoEtiquetaNfc" AS ENUM ('TABLE_OPERATION', 'MENU', 'FEEDBACK');

-- CreateTable
CREATE TABLE "restaurantes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "menu_url" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "restaurante_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pisos" (
    "id" SERIAL NOT NULL,
    "restaurante_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" SERIAL NOT NULL,
    "restaurante_id" INTEGER NOT NULL,
    "piso_id" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "estado" "EstadoMesa" NOT NULL DEFAULT 'AVAILABLE',
    "posicion_x" INTEGER NOT NULL DEFAULT 0,
    "posicion_y" INTEGER NOT NULL DEFAULT 0,
    "forma" "FormaMesa" NOT NULL DEFAULT 'RECTANGLE',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" SERIAL NOT NULL,
    "restaurante_id" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "personas" INTEGER NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'WAITING',
    "fecha_hora_llegada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentado_en" TIMESTAMP(3),
    "cancelado_en" TIMESTAMP(3),
    "completado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones_mesa" (
    "id" SERIAL NOT NULL,
    "restaurante_id" INTEGER NOT NULL,
    "mesa_id" INTEGER NOT NULL,
    "turno_id" INTEGER NOT NULL,
    "asignado_por_id" INTEGER NOT NULL,
    "cerrado_por_id" INTEGER,
    "capacidad_original" INTEGER NOT NULL,
    "personas_turno" INTEGER NOT NULL,
    "excede_capacidad" BOOLEAN NOT NULL DEFAULT false,
    "personas_extra" INTEGER NOT NULL DEFAULT 0,
    "asignacion_manual" BOOLEAN NOT NULL DEFAULT false,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fin" TIMESTAMP(3),

    CONSTRAINT "sesiones_mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" SERIAL NOT NULL,
    "restaurante_id" INTEGER NOT NULL,
    "mesa_id" INTEGER,
    "turno_id" INTEGER,
    "usuario_id" INTEGER,
    "tipo" "TipoEvento" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "origen" "OrigenEvento" NOT NULL,
    "metadata" JSONB,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiquetas_nfc" (
    "id" SERIAL NOT NULL,
    "restaurante_id" INTEGER NOT NULL,
    "mesa_id" INTEGER,
    "token_hash" VARCHAR(64) NOT NULL,
    "tipo" "TipoEtiquetaNfc" NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_uso_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etiquetas_nfc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurantes_slug_key" ON "restaurantes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "usuarios_restaurante_id_idx" ON "usuarios"("restaurante_id");

-- CreateIndex
CREATE INDEX "pisos_restaurante_id_orden_idx" ON "pisos"("restaurante_id", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "pisos_restaurante_id_nombre_key" ON "pisos"("restaurante_id", "nombre");

-- CreateIndex
CREATE INDEX "mesas_restaurante_id_estado_idx" ON "mesas"("restaurante_id", "estado");

-- CreateIndex
CREATE INDEX "mesas_piso_id_idx" ON "mesas"("piso_id");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_restaurante_id_numero_key" ON "mesas"("restaurante_id", "numero");

-- CreateIndex
CREATE INDEX "turnos_restaurante_id_estado_idx" ON "turnos"("restaurante_id", "estado");

-- CreateIndex
CREATE INDEX "turnos_fecha_hora_llegada_idx" ON "turnos"("fecha_hora_llegada");

-- CreateIndex
CREATE UNIQUE INDEX "turnos_restaurante_id_codigo_key" ON "turnos"("restaurante_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_mesa_turno_id_key" ON "sesiones_mesa"("turno_id");

-- CreateIndex
CREATE INDEX "sesiones_mesa_restaurante_id_idx" ON "sesiones_mesa"("restaurante_id");

-- CreateIndex
CREATE INDEX "sesiones_mesa_mesa_id_fin_idx" ON "sesiones_mesa"("mesa_id", "fin");

-- CreateIndex
CREATE INDEX "eventos_restaurante_id_fecha_hora_idx" ON "eventos"("restaurante_id", "fecha_hora");

-- CreateIndex
CREATE INDEX "eventos_mesa_id_idx" ON "eventos"("mesa_id");

-- CreateIndex
CREATE INDEX "eventos_turno_id_idx" ON "eventos"("turno_id");

-- CreateIndex
CREATE INDEX "eventos_usuario_id_idx" ON "eventos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_nfc_token_hash_key" ON "etiquetas_nfc"("token_hash");

-- CreateIndex
CREATE INDEX "etiquetas_nfc_restaurante_id_tipo_idx" ON "etiquetas_nfc"("restaurante_id", "tipo");

-- CreateIndex
CREATE INDEX "etiquetas_nfc_mesa_id_idx" ON "etiquetas_nfc"("mesa_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pisos" ADD CONSTRAINT "pisos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_piso_id_fkey" FOREIGN KEY ("piso_id") REFERENCES "pisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_mesa" ADD CONSTRAINT "sesiones_mesa_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_mesa" ADD CONSTRAINT "sesiones_mesa_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_mesa" ADD CONSTRAINT "sesiones_mesa_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_mesa" ADD CONSTRAINT "sesiones_mesa_asignado_por_id_fkey" FOREIGN KEY ("asignado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_mesa" ADD CONSTRAINT "sesiones_mesa_cerrado_por_id_fkey" FOREIGN KEY ("cerrado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etiquetas_nfc" ADD CONSTRAINT "etiquetas_nfc_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etiquetas_nfc" ADD CONSTRAINT "etiquetas_nfc_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
