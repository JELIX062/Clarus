<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">CLARUS</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">

                    <!-- Admin -->
                    <template v-if="rolUsuario === 'administrador'">
                        <li class="nav_item margin">
                            <router-link class="nav-link item" to="/admin/sucursales">Sucursal</router-link>
                        </li>
                        <li class="nav_item margin">
                            <router-link class="nav-link item" to="/admin/doctores">Doctores</router-link>
                        </li>
                        <li class="nav_item margin">
                            <router-link class="nav-link item" to="/admin/recepcionistas">Recepcionistas</router-link>
                        </li>
                    </template>

                    <!-- Otros roles -->
                    <template v-else>
                        <li class="nav_item margin">
                            <router-link class="nav-link item" :to="rutaCitas">Citas</router-link>
                        </li>
                        <li v-if="rolUsuario === 'recepcionista'" class="nav_item margin">
                            <router-link class="nav-link item" to="/recepcionista/pacientes">Pacientes</router-link>
                        </li>
                        <li v-if="rolUsuario !== 'recepcionista'" class="nav_item margin">
                            <router-link class="nav-link item" :to="rutaSecundaria">{{ etiquetaSecundaria }}</router-link>
                        </li>
                        <li class="nav_item margin">
                            <router-link class="nav-link item" to="/perfil">Perfil</router-link>
                        </li>
                    </template>

                </ul>

                <span v-if="rolUsuario === 'paciente'" class="saldo-badge">
                    Saldo: ${{ Number(usuarioActual?.saldo_pendiente ?? 0).toFixed(2) }}
                </span>
                <!-- Notificaciones para paciente y doctor -->
                <li v-if="rolUsuario === 'paciente' || rolUsuario === 'doctor'" class="nav_item margin position-relative">
                    <button
                        class="btn-notif"
                        type="button"
                        @click="mostrarNotificaciones = !mostrarNotificaciones; cargarNotificaciones()"
                    >
                        Notificaciones
                        <span v-if="noLeidas > 0" class="badge rounded-pill bg-danger ms-1">
                            {{ noLeidas > 9 ? '9+' : noLeidas }}
                        </span>
                    </button>

                    <div v-if="mostrarNotificaciones" class="notif-dropdown" @click.stop>
                        <div class="notif-header">
                            <span>Notificaciones</span>
                            <button v-if="noLeidas > 0" class="notif-mark-all" @click="marcarTodasLeidas">
                                Marcar todas como leídas
                            </button>
                        </div>
                        <div v-if="notificaciones.length === 0" class="notif-empty">
                            No hay notificaciones.
                        </div>
                        <div
                            v-for="n in notificaciones"
                            :key="n.id_notificacion"
                            class="notif-item"
                            :class="{ 'notif-unread': n.leida === 0 || n.leida === false }"
                        >
                            <div class="notif-item-header">
                                <strong>{{ n.titulo }}</strong>
                                <button
                                    v-if="n.leida === 0 || n.leida === false"
                                    class="notif-btn-leida"
                                    type="button"
                                    @click="marcarLeida(n.id_notificacion)"
                                >
                                    ✓
                                </button>
                            </div>
                            <p>{{ n.mensaje }}</p>
                            <small>{{ new Date(n.fecha_creacion).toLocaleDateString('es-MX') }}</small>
                        </div>
                    </div>
                </li>

                <button class="btn btn-danger btn-sm" @click="cerrarSesionYRedirigir">Cerrar sesión</button>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSesion } from '../controladores/useSesion'

const router = useRouter()
const { rolUsuario, cerrarSesion, usuarioActual } = useSesion()

const API                   = 'http://localhost:3001/api'
const notificaciones        = ref<any[]>([])
const mostrarNotificaciones = ref(false)

const cerrarSesionYRedirigir = () => {
    cerrarSesion()
    void router.push({ name: 'inicio-sesion' })
}

const etiquetaSecundaria = computed(() => {
    if (rolUsuario.value === 'doctor')        return 'Expedientes'
    if (rolUsuario.value === 'recepcionista') return 'Nueva cuenta'
    return 'Recetas'
})

const rutaCitas = computed(() => '/citas')
const rutaSecundaria = computed(() => {
    if (rolUsuario.value === 'doctor')        return '/expedientes'
    if (rolUsuario.value === 'recepcionista') return '/crear-cuenta'
    return '/recetas'
})

const cargarNotificaciones = async () => {
    if (!usuarioActual.value?.id_usuario) return
    const res  = await fetch(`${API}/notificacion/${usuarioActual.value.id_usuario}`)
    const data = await res.json()
    if (Array.isArray(data)) notificaciones.value = data
}

const noLeidas = computed(() =>
    notificaciones.value.filter(n => n.leida === 0 || n.leida === false).length
)

const marcarLeida = async (id_notificacion: number) => {
    await fetch(`${API}/notificacion/leida`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            id_notificacion,
            id_usuario: usuarioActual.value?.id_usuario
        })
    })
    await cargarNotificaciones()
}

const marcarTodasLeidas = async () => {
    await fetch(`${API}/notificacion/leidastodas`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id_usuario: usuarioActual.value?.id_usuario })
    })
    await cargarNotificaciones()
}

onMounted(cargarNotificaciones)
</script>

<style scoped>
.navbar {
    background: var(--clarus-midnight) !important;
    box-shadow: 0 10px 24px var(--clarus-shadow);
}

.navbar-brand,
.item {
    color: var(--clarus-ivory) !important;
}

.navbar-brand {
    font-weight: 700;
    letter-spacing: 0.08em;
}

.item.router-link-active {
    color: var(--clarus-gold) !important;
    font-weight: 700;
}

.item:hover {
    color: var(--clarus-gold) !important;
}

.btn-cerrar {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-size: inherit;
}

.btn-notif {
    background: var(--clarus-gold);
    border: none;
    color: var(--clarus-ivory);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-right: 0.75rem;
}

.btn-notif:hover {
    background: var(--clarus-gold-soft);
    color: var(--clarus-midnight);
}

.notif-dropdown {
    position: absolute;
    top: calc(100% + 0.75rem);
    right: 0;
    width: 320px;
    background: var(--clarus-ivory);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    z-index: 999;
    max-height: 400px;
    overflow-y: auto;
}

.notif-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    font-weight: 700;
    color: var(--clarus-midnight);
}

.notif-mark-all {
    background: none;
    border: none;
    font-size: 0.78rem;
    color: var(--clarus-gold);
    cursor: pointer;
    font-weight: 600;
}

.notif-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
}

.notif-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notif-item strong {
    font-size: 0.9rem;
    color: var(--clarus-midnight);
}

.notif-item p {
    margin: 0.2rem 0 0;
    font-size: 0.82rem;
    color: var(--clarus-oxford);
}

.notif-item small {
    font-size: 0.75rem;
    color: #94a3b8;
}

.notif-unread {
    background: #fefce8;
}

.notif-empty {
    padding: 1rem;
    text-align: center;
    color: var(--clarus-oxford);
    font-size: 0.9rem;
}

.notif-btn-leida {
    background: none;
    border: 1px solid var(--clarus-gold);
    color: var(--clarus-gold);
    border-radius: 999px;
    width: 22px;
    height: 22px;
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.notif-btn-leida:hover {
    background: var(--clarus-gold);
    color: var(--clarus-ivory);
}

.saldo-badge {
    background: var(--clarus-gold-soft);
    color: var(--clarus-midnight);
    border-radius: 0.25rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    margin-right: 0.75rem;
}

.nav_item {
    list-style: none;
}
</style>