<template>
    <section class="recetas-view">
        <header class="header">
        <div>
            <h2>Mis recetas médicas</h2>
            <p class="subtitle">Revisa tus medicamentos, vigencia de receta e indicaciones de uso.</p>
        </div>
        <button class="button" type="button" @click="showDialog = true">Solicitar renovación</button>
        </header>

        <div class="filters">
        <input
            v-model.trim="searchTerm"
            class="input"
            type="search"
            placeholder="Buscar por medicamento"
        />
        <select v-model="selectedStatus" class="input select">
            <option value="Todas">Todos los estados</option>
            <option v-for="status in statusOptions" :key="status" :value="status">
            {{ status }}
            </option>
        </select>
        </div>

        <div class="recipes-grid">
        <article v-for="prescription in filteredPrescriptions" :key="prescription.id" class="recipe-card">
            <div class="card-top">
            <h3>{{ prescription.medicine }}</h3>
            <span class="tag" :class="statusClass[prescription.status]">{{ prescription.status }}</span>
            </div>
            <p class="meta">👨‍⚕️ {{ prescription.doctor }} · 📅 Emitida: {{ prescription.issueDate }}</p>
            <p class="line"><strong>Dosis:</strong> {{ prescription.dose }}</p>
            <p class="line"><strong>Frecuencia:</strong> {{ prescription.frequency }}</p>
            <p class="line"><strong>Duración:</strong> {{ prescription.durationDays }} días</p>
            <p class="line"><strong>Vence:</strong> {{ prescription.expirationDate }}</p>
            <p class="line"><strong>Refills disponibles:</strong> {{ prescription.refillsLeft }}</p>
            <p class="description"><strong>Indicaciones:</strong> {{ prescription.instructions }}</p>
        </article>

        <div v-if="filteredPrescriptions.length === 0" class="empty-state">
            No se encontraron recetas con los filtros seleccionados.
        </div>
        </div>

        <div v-if="showDialog" class="dialog-backdrop" @click.self="closeDialog">
        <div class="dialog">
            <h3>Solicitar renovación de receta</h3>
            <form class="form" @submit.prevent="saveRenewalRequest">
            <label for="medicine">Medicamento</label>
            <input
                id="medicine"
                v-model.trim="renewalForm.medicine"
                class="input"
                type="text"
                maxlength="80"
                placeholder="Ej: Losartán"
            />

            <label for="reason">Motivo</label>
            <select id="reason" v-model="renewalForm.reason" class="input select">
                <option disabled value="">Selecciona un motivo</option>
                <option v-for="reason in reasonOptions" :key="reason" :value="reason">{{ reason }}</option>
            </select>

            <label for="notes">Notas para el médico</label>
            <textarea
                id="notes"
                v-model.trim="renewalForm.notes"
                class="input textarea"
                rows="3"
                placeholder="Ej: Me quedan 3 tabletas"
            ></textarea>

            <div class="actions">
                <button class="button button-white" type="button" @click="closeDialog">Cancelar</button>
                <button class="button" type="submit">Enviar solicitud</button>
            </div>
            </form>
        </div>
        </div>

        <div v-if="renewalRequests.length > 0" class="requests-panel">
        <h3>Solicitudes enviadas</h3>
        <ul class="request-list">
            <li v-for="request in renewalRequests" :key="request.id" class="request-item">
            <strong>{{ request.medicine }}</strong> · {{ request.reason }} · {{ request.date }}
            </li>
        </ul>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { computed, reactive, ref } from 'vue'

    type PrescriptionStatus = 'Vigente' | 'Por vencer' | 'Vencida'

    type Prescription = {
    id: string
    medicine: string
    doctor: string
    dose: string
    frequency: string
    durationDays: number
    issueDate: string
    expirationDate: string
    refillsLeft: number
    instructions: string
    status: PrescriptionStatus
    }

    type RenewalReason = 'Sin dosis disponibles' | 'Receta vencida' | 'Pérdida de receta'

    type RenewalRequest = {
    id: string
    medicine: string
    reason: RenewalReason
    notes: string
    date: string
    }

    const statusOptions: PrescriptionStatus[] = ['Vigente', 'Por vencer', 'Vencida']
    const reasonOptions: RenewalReason[] = ['Sin dosis disponibles', 'Receta vencida', 'Pérdida de receta']

    const statusClass: Record<PrescriptionStatus, string> = {
    Vigente: 'status-active',
    'Por vencer': 'status-warning',
    Vencida: 'status-stopped'
    }

    const prescriptions = ref<Prescription[]>([])

    const renewalRequests = ref<RenewalRequest[]>([])
    const searchTerm = ref('')
    const selectedStatus = ref<'Todas' | PrescriptionStatus>('Todas')
    const showDialog = ref(false)

    const renewalForm = reactive<{
    medicine: string
    reason: '' | RenewalReason
    notes: string
    }>({
    medicine: '',
    reason: '',
    notes: ''
    })

    const filteredPrescriptions = computed(() => {
    const term = searchTerm.value.toLowerCase()

    return prescriptions.value.filter((prescription) => {
        const matchesStatus = selectedStatus.value === 'Todas' || prescription.status === selectedStatus.value
        const matchesSearch = prescription.medicine.toLowerCase().includes(term)

        return matchesStatus && matchesSearch
    })
    })

    function closeDialog() {
    showDialog.value = false
    renewalForm.medicine = ''
    renewalForm.reason = ''
    renewalForm.notes = ''
    }

    function saveRenewalRequest() {
    if (!renewalForm.medicine || !renewalForm.reason) {
        return
    }

    renewalRequests.value.unshift({
        id: crypto.randomUUID(),
        medicine: renewalForm.medicine,
        reason: renewalForm.reason,
        notes: renewalForm.notes,
        date: new Date().toISOString().slice(0, 10)
    })

    closeDialog()
    }
</script>

<style scoped>
    .recetas-view {
    padding: 1.5rem;
    }

    .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    }

    .subtitle {
    margin: 0.25rem 0 0;
    color: #6a6a6a;
    }

    .filters {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
    }

    .recipes-grid {
    display: grid;
    gap: 0.85rem;
    }

    .recipe-card,
    .empty-state,
    .requests-panel {
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .requests-panel {
    margin-top: 1rem;
    }

    .request-list {
    margin: 0.6rem 0 0;
    padding-left: 1rem;
    }

    .request-item {
    margin-bottom: 0.35rem;
    }

    .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    }

    .tag {
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    }

    .status-active {
    background: #e8f8ef;
    color: #1f8a4d;
    }

    .status-warning {
    background: #fff8e6;
    color: #a66a00;
    }

    .status-stopped {
    background: #ffecef;
    color: #c0392b;
    }

    .meta,
    .line,
    .description {
    margin: 0.45rem 0 0;
    }

    .input {
    border: 1px solid #cfd7e3;
    border-radius: 8px;
    padding: 0.55rem;
    }

    .select,
    .textarea {
    width: 100%;
    }

    .button {
    border: 1px solid #2e86de;
    background: #2e86de;
    color: #fff;
    border-radius: 8px;
    padding: 0.5rem 0.9rem;
    cursor: pointer;
    }

    .button-white {
    background: #fff;
    color: #2e86de;
    }

    .dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
    }

    .dialog {
    width: min(520px, 92vw);
    background: #fff;
    border-radius: 12px;
    padding: 1rem;
    }

    .form {
    display: grid;
    gap: 0.55rem;
    }

    .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 0.35rem;
    }

    @media (max-width: 760px) {
    .filters {
        grid-template-columns: 1fr;
    }

    .header {
        flex-direction: column;
        align-items: flex-start;
    }
    }
</style>