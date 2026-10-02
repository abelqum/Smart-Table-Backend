/*
  Warnings:

  - You are about to drop the column `asignacion_manual` on the `sesiones_mesa` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `turnos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[restaurante_id,fecha_operacion,numero]` on the table `turnos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numero` to the `turnos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoEvento" ADD VALUE 'WAITLIST_UPDATED';
ALTER TYPE "TipoEvento" ADD VALUE 'WAITLIST_CALLED';

-- DropIndex
DROP INDEX "turnos_restaurante_id_codigo_key";

-- AlterTable
ALTER TABLE "restaurantes" ADD COLUMN     "direccion" VARCHAR(255),
ADD COLUMN     "telefono" VARCHAR(30);

-- AlterTable
ALTER TABLE "sesiones_mesa" DROP COLUMN "asignacion_manual",
ADD COLUMN     "excepcion_capacidad_autorizada" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "turnos" DROP COLUMN "codigo",
ADD COLUMN     "fecha_operacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "llamado_en" TIMESTAMP(3),
ADD COLUMN     "numero" INTEGER NOT NULL,
ADD COLUMN     "piso_preferido_id" INTEGER;

-- CreateIndex
CREATE INDEX "turnos_restaurante_id_fecha_operacion_estado_idx" ON "turnos"("restaurante_id", "fecha_operacion", "estado");

-- CreateIndex
CREATE INDEX "turnos_piso_preferido_id_idx" ON "turnos"("piso_preferido_id");

-- CreateIndex
CREATE INDEX "turnos_llamado_en_idx" ON "turnos"("llamado_en");

-- CreateIndex
CREATE UNIQUE INDEX "turnos_restaurante_id_fecha_operacion_numero_key" ON "turnos"("restaurante_id", "fecha_operacion", "numero");

-- CreateIndex
CREATE INDEX "usuarios_restaurante_id_rol_idx" ON "usuarios"("restaurante_id", "rol");

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_piso_preferido_id_fkey" FOREIGN KEY ("piso_preferido_id") REFERENCES "pisos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
